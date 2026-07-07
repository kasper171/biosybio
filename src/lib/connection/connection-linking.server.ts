import type { HotelProfileData } from "@/lib/hotel/types";
import {
  verifyDiscordOwnershipServer,
  verifyHotelOwnershipServer,
} from "@/lib/connection-verify.server";

type AdminClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (col: string, val: string) => {
        neq: (col: string, val: string) => {
          maybeSingle: () => Promise<{ data: { id: string } | null; error: Error | null }>;
        };
      };
      ilike: (col: string, val: string) => {
        eq: (col: string, val: string) => {
          neq: (col: string, val: string) => {
            maybeSingle: () => Promise<{ data: { id: string } | null; error: Error | null }>;
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
  };
};

export type ConnectionConflict = {
  type: "discord" | "habbo" | "habblet";
  otherProfileId: string;
};

export async function findConnectionConflict(
  admin: AdminClient,
  ownerId: string,
  input:
    | { type: "discord"; discordUserId: string }
    | { type: "habbo"; username: string; hotelDomain: string }
    | { type: "habblet"; username: string },
): Promise<ConnectionConflict | null> {
  if (input.type === "discord") {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("discord_user_id", input.discordUserId)
      .neq("id", ownerId)
      .maybeSingle();
    return data ? { type: "discord", otherProfileId: data.id } : null;
  }

  if (input.type === "habbo") {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .ilike("habbo_username", input.username)
      .eq("habbo_domain", input.hotelDomain)
      .neq("id", ownerId)
      .maybeSingle();
    return data ? { type: "habbo", otherProfileId: data.id } : null;
  }

  const { data } = await admin
    .from("profiles")
    .select("id")
    .ilike("habblet_username", input.username)
    .neq("id", ownerId)
    .maybeSingle();
  return data ? { type: "habblet", otherProfileId: data.id } : null;
}

export async function clearConnectionFromProfile(
  admin: AdminClient,
  profileId: string,
  type: ConnectionConflict["type"],
): Promise<void> {
  if (type === "discord") {
    await admin.from("profiles").update({ discord_user_id: null }).eq("id", profileId);
    return;
  }
  if (type === "habbo") {
    await admin.from("profiles").update({
      habbo_username: null,
      habbo_domain: null,
      habbo_figure: null,
      habbo_motto: null,
      habbo_level: null,
    }).eq("id", profileId);
    return;
  }
  await admin.from("profiles").update({
    habblet_username: null,
    habblet_figure: null,
    habblet_motto: null,
    habblet_achievement_points: null,
  }).eq("id", profileId);
}

export type LinkConnectionResult =
  | { ok: true; patch: Record<string, unknown> }
  | { ok: false; error: string; code?: string }
  | { ok: false; needsTransfer: true };

export async function linkVerifiedConnection(options: {
  admin: AdminClient;
  ownerId: string;
  forceTransfer: boolean;
  input:
    | {
        type: "discord";
        discordUserId: string;
        otp: string;
        unlockAt: number;
        expiresAt: number;
      }
    | {
        type: "habbo";
        username: string;
        hotelDomain: string;
        otp: string;
        unlockAt: number;
        expiresAt: number;
      }
    | {
        type: "habblet";
        username: string;
        otp: string;
        unlockAt: number;
        expiresAt: number;
      };
}): Promise<LinkConnectionResult> {
  const { admin, ownerId, forceTransfer, input } = options;

  if (input.type === "discord") {
    const verified = await verifyDiscordOwnershipServer(
      input.discordUserId,
      input.otp,
      input.unlockAt,
      input.expiresAt,
    );
    if (!verified.ok) {
      return { ok: false, error: mapVerifyError(verified.error, "discord"), code: verified.error };
    }

    const conflict = await findConnectionConflict(admin, ownerId, {
      type: "discord",
      discordUserId: input.discordUserId,
    });
    if (conflict && !forceTransfer) {
      return { ok: false, needsTransfer: true };
    }
    if (conflict && forceTransfer) {
      await clearConnectionFromProfile(admin, conflict.otherProfileId, conflict.type);
    }

    return {
      ok: true,
      patch: { discord_user_id: input.discordUserId },
    };
  }

  if (input.type === "habbo") {
    const verified = await verifyHotelOwnershipServer(
      "habbo",
      input.username,
      input.hotelDomain,
      input.otp,
      input.unlockAt,
      input.expiresAt,
    );
    if (!verified.ok) {
      return { ok: false, error: mapVerifyError(verified.error, "habbo"), code: verified.error };
    }

    const conflict = await findConnectionConflict(admin, ownerId, {
      type: "habbo",
      username: verified.profile.username,
      hotelDomain: verified.profile.hotelDomain ?? input.hotelDomain,
    });
    if (conflict && !forceTransfer) {
      return { ok: false, needsTransfer: true };
    }
    if (conflict && forceTransfer) {
      await clearConnectionFromProfile(admin, conflict.otherProfileId, conflict.type);
    }

    return { ok: true, patch: hotelDataToPatch(verified.profile) };
  }

  const verified = await verifyHotelOwnershipServer(
    "habblet",
    input.username,
    null,
    input.otp,
    input.unlockAt,
    input.expiresAt,
  );
  if (!verified.ok) {
    return { ok: false, error: mapVerifyError(verified.error, "habblet"), code: verified.error };
  }

  const conflict = await findConnectionConflict(admin, ownerId, {
    type: "habblet",
    username: verified.profile.username,
  });
  if (conflict && !forceTransfer) {
    return { ok: false, needsTransfer: true };
  }
  if (conflict && forceTransfer) {
    await clearConnectionFromProfile(admin, conflict.otherProfileId, conflict.type);
  }

  return { ok: true, patch: hotelDataToPatch(verified.profile) };
}

function hotelDataToPatch(data: HotelProfileData): Record<string, unknown> {
  if (data.platform === "habbo") {
    return {
      habbo_username: data.username,
      habbo_domain: data.hotelDomain,
      habbo_figure: data.figure,
      habbo_motto: data.motto,
      habbo_level: data.level,
    };
  }
  return {
    habblet_username: data.username,
    habblet_figure: data.figure,
    habblet_motto: data.motto,
    habblet_achievement_points: data.achievementPoints,
  };
}

function mapVerifyError(
  error: string,
  platform: "discord" | "habbo" | "habblet",
): string {
  switch (error) {
    case "invalid_id":
      return "ID do Discord inválido.";
    case "invalid_username":
      return "Nome do jogador inválido.";
    case "invalid_hotel":
      return "Hotel inválido.";
    case "not_in_lanyard":
      return "Você não está no servidor Lanyard.";
    case "profile_not_found":
      return "Não foi possível encontrar este perfil do Discord.";
    case "user_not_found":
      return "Jogador não encontrado.";
    case "code_not_found":
      return platform === "discord"
        ? "O código não foi encontrado na descrição do seu perfil."
        : "O código não foi encontrado na missão do seu personagem.";
    case "expired":
      return "O código expirou. Gere um novo código e tente novamente.";
    case "waiting":
      return "Aguarde 50 segundos antes de validar.";
    default:
      return "Falha ao validar. Tente novamente em instantes.";
  }
}
