import "@tanstack/react-start/server-only";

import type { AlbumHotelProfileData } from "@/features/album/lib/hotel/album-hotel.types";
import {
  albumVerifyDiscordOwnershipServer,
  albumVerifyHotelOwnershipServer,
} from "@/features/album/lib/connection/album-connection-verify.server";
import {
  ALBUM_CONNECTION_OTP_WAIT_MS,
  ALBUM_HOTEL_OTP_WAIT_SECONDS,
} from "@/features/album/lib/connection/album-connection-verify";

type AdminClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (col: string, val: string) => {
        neq: (col: string, val: string) => {
          maybeSingle: () => Promise<{ data: { user_id: string } | null; error: Error | null }>;
        };
      };
      ilike: (col: string, val: string) => {
        eq: (col: string, val: string) => {
          neq: (col: string, val: string) => {
            maybeSingle: () => Promise<{ data: { user_id: string } | null; error: Error | null }>;
          };
        };
      };
    };
    update: (values: Record<string, unknown>) => {
      eq: (col: string, val: string) => Promise<{ error: Error | null }>;
      ilike: (col: string, val: string) => {
        eq: (col: string, val: string) => Promise<{ error: Error | null }>;
      };
    };
    upsert: (values: Record<string, unknown>) => {
      eq: (col: string, val: string) => Promise<{ error: Error | null }>;
    };
  };
};

export type AlbumConnectionConflict = {
  type: "discord" | "habbo" | "habblet";
  otherUserId: string;
};

export async function albumFindConnectionConflict(
  admin: AdminClient,
  ownerId: string,
  input:
    | { type: "discord"; discordUserId: string }
    | { type: "habbo"; username: string; hotelDomain: string }
    | { type: "habblet"; username: string },
): Promise<AlbumConnectionConflict | null> {
  if (input.type === "discord") {
    const { data } = await admin
      .from("album_connections")
      .select("user_id")
      .eq("discord_user_id", input.discordUserId)
      .neq("user_id", ownerId)
      .maybeSingle();
    return data ? { type: "discord", otherUserId: data.user_id } : null;
  }

  if (input.type === "habbo") {
    const { data } = await admin
      .from("album_connections")
      .select("user_id")
      .ilike("habbo_username", input.username)
      .eq("habbo_domain", input.hotelDomain)
      .neq("user_id", ownerId)
      .maybeSingle();
    return data ? { type: "habbo", otherUserId: data.user_id } : null;
  }

  const { data } = await admin
    .from("album_connections")
    .select("user_id")
    .ilike("habblet_username", input.username)
    .neq("user_id", ownerId)
    .maybeSingle();
  return data ? { type: "habblet", otherUserId: data.user_id } : null;
}

export async function albumClearConnection(
  admin: AdminClient,
  userId: string,
  type: AlbumConnectionConflict["type"],
): Promise<void> {
  if (type === "discord") {
    await admin.from("album_connections").update({ discord_user_id: null }).eq("user_id", userId);
    return;
  }
  if (type === "habbo") {
    await admin
      .from("album_connections")
      .update({
        habbo_username: null,
        habbo_domain: null,
        habbo_figure: null,
        habbo_motto: null,
        habbo_level: null,
        habbo_synced_at: null,
      })
      .eq("user_id", userId);
    return;
  }
  await admin
    .from("album_connections")
    .update({
      habblet_username: null,
      habblet_figure: null,
      habblet_motto: null,
      habblet_achievement_points: null,
      habblet_synced_at: null,
    })
    .eq("user_id", userId);
}

function hotelToPatch(profile: AlbumHotelProfileData): Record<string, unknown> {
  if (profile.platform === "habblet") {
    return {
      habblet_username: profile.username,
      habblet_figure: profile.figure,
      habblet_motto: profile.motto,
      habblet_achievement_points: profile.achievementPoints ?? null,
      habblet_synced_at: new Date().toISOString(),
    };
  }
  return {
    habbo_username: profile.username,
    habbo_domain: profile.hotelDomain ?? "com.br",
    habbo_figure: profile.figure,
    habbo_motto: profile.motto,
    habbo_level: profile.level ?? null,
    habbo_synced_at: new Date().toISOString(),
  };
}

function mapVerifyError(code: string, platform: "discord" | "hotel"): string {
  switch (code) {
    case "waiting":
      return platform === "discord"
        ? `Wait ${ALBUM_CONNECTION_OTP_WAIT_MS / 1000} seconds before validating.`
        : `Wait ${ALBUM_HOTEL_OTP_WAIT_SECONDS} seconds before validating.`;
    case "expired":
      return "The code expired. Generate a new one and try again.";
    case "code_not_found":
      return "The code was not found in your motto/bio.";
    case "not_in_lanyard":
      return "Discord user not found in Lanyard.";
    case "user_not_found":
      return "Player not found.";
    default:
      return "Validation failed. Try again in a moment.";
  }
}

export type AlbumLinkConnectionResult =
  | { ok: true; patch: Record<string, unknown> }
  | { ok: false; error: string; code?: string }
  | { ok: false; needsTransfer: true };

export async function albumLinkVerifiedConnection(options: {
  admin: AdminClient;
  ownerId: string;
  forceTransfer: boolean;
  input:
    | { type: "discord"; discordUserId: string; otp: string; unlockAt: number; expiresAt: number }
    | { type: "habbo"; username: string; hotelDomain: string; otp: string; unlockAt: number; expiresAt: number }
    | { type: "habblet"; username: string; otp: string; unlockAt: number; expiresAt: number };
}): Promise<AlbumLinkConnectionResult> {
  const { admin, ownerId, forceTransfer, input } = options;

  if (input.type === "discord") {
    const verified = await albumVerifyDiscordOwnershipServer(
      input.discordUserId,
      input.otp,
      input.unlockAt,
      input.expiresAt,
    );
    if (!verified.ok) {
      return { ok: false, error: mapVerifyError(verified.error, "discord"), code: verified.error };
    }

    const conflict = await albumFindConnectionConflict(admin, ownerId, {
      type: "discord",
      discordUserId: input.discordUserId,
    });
    if (conflict && !forceTransfer) return { ok: false, needsTransfer: true };
    if (conflict && forceTransfer) await albumClearConnection(admin, conflict.otherUserId, conflict.type);

    return { ok: true, patch: { discord_user_id: input.discordUserId } };
  }

  if (input.type === "habbo") {
    const verified = await albumVerifyHotelOwnershipServer(
      "habbo",
      input.username,
      input.hotelDomain,
      input.otp,
      input.unlockAt,
      input.expiresAt,
    );
    if (!verified.ok) {
      return { ok: false, error: mapVerifyError(verified.error, "hotel"), code: verified.error };
    }

    const conflict = await albumFindConnectionConflict(admin, ownerId, {
      type: "habbo",
      username: verified.profile.username,
      hotelDomain: verified.profile.hotelDomain ?? input.hotelDomain,
    });
    if (conflict && !forceTransfer) return { ok: false, needsTransfer: true };
    if (conflict && forceTransfer) await albumClearConnection(admin, conflict.otherUserId, conflict.type);

    return { ok: true, patch: hotelToPatch(verified.profile) };
  }

  const verified = await albumVerifyHotelOwnershipServer(
    "habblet",
    input.username,
    null,
    input.otp,
    input.unlockAt,
    input.expiresAt,
  );
  if (!verified.ok) {
    return { ok: false, error: mapVerifyError(verified.error, "hotel"), code: verified.error };
  }

  const conflict = await albumFindConnectionConflict(admin, ownerId, {
    type: "habblet",
    username: verified.profile.username,
  });
  if (conflict && !forceTransfer) return { ok: false, needsTransfer: true };
  if (conflict && forceTransfer) await albumClearConnection(admin, conflict.otherUserId, conflict.type);

  return { ok: true, patch: hotelToPatch(verified.profile) };
}
