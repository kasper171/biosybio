import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedUserId } from "@/lib/require-auth.server";
import { getClientIp } from "@/lib/get-client-ip.server";
import { consumeRateLimit, rateLimitBucket } from "@/lib/rate-limit.server";
import { parseAndSanitizeAlbumLayoutPayload } from "@/features/album/lib/security/album-layout-schema";
import {
  albumFindConnectionConflict,
  albumLinkVerifiedConnection,
} from "@/features/album/lib/connection/album-connection-linking.server";
import { albumVerifyHotelOwnershipServer } from "@/features/album/lib/connection/album-connection-verify.server";
import { albumVerifyDiscordOwnershipServer } from "@/features/album/lib/connection/album-connection-verify.server";
import { ALBUM_HOTEL_OTP_WAIT_SECONDS } from "@/features/album/lib/connection/album-connection-verify";
import type { ProfileDisplayStyle } from "@/features/album/types/album.types";
import { ALBUM_VIDEO_MAX_BYTES_PREMIUM } from "@/features/album/lib/security/album-upload-validation";
import {
  albumReleaseStorageBytes,
  albumReserveStorageBytes,
} from "@/features/album/services/albumStorage.server";
import {
  albumStoragePathOwnedByUser,
  validateAlbumMediaBuffer,
} from "@/features/album/lib/security/album-upload-validation.server";

const styleSchema = z.object({
  style: z.enum(["card", "album"]),
});

const layoutSaveSchema = z.object({
  layout: z.unknown(),
  theme: z.unknown().optional(),
});

const otpFields = {
  otp: z.string().min(8).max(8),
  unlockAt: z.number(),
  expiresAt: z.number(),
  forceTransfer: z.boolean().optional(),
};

const checkConflictInput = z.discriminatedUnion("type", [
  z.object({ type: z.literal("discord"), discordUserId: z.string().regex(/^\d{15,22}$/) }),
  z.object({ type: z.literal("habbo"), username: z.string().min(2).max(64), hotelDomain: z.string().min(2).max(32) }),
  z.object({ type: z.literal("habblet"), username: z.string().min(2).max(64) }),
]);

const verifyHotelMottoInput = z.object({
  platform: z.enum(["habbo", "habblet"]),
  username: z.string().min(2).max(64),
  hotelDomain: z.string().min(2).max(32).optional(),
  otp: z.string().min(8).max(8),
  unlockAt: z.number(),
  expiresAt: z.number(),
});

const linkConnectionInput = z.discriminatedUnion("type", [
  z.object({ type: z.literal("discord"), discordUserId: z.string().regex(/^\d{15,22}$/), ...otpFields }),
  z.object({
    type: z.literal("habbo"),
    username: z.string().min(2).max(64),
    hotelDomain: z.string().min(2).max(32),
    ...otpFields,
  }),
  z.object({ type: z.literal("habblet"), username: z.string().min(2).max(64), ...otpFields }),
]);

export const saveAlbumDisplayStyleFn = createServerFn({ method: "POST" })
  .inputValidator(styleSchema)
  .handler(async ({ data }) => {
    const userId = await requireAuthenticatedUserId();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const allowed = await consumeRateLimit(
      supabaseAdmin,
      rateLimitBucket(["album-style-save", userId]),
      20,
      3600,
    );
    if (allowed.kind === "denied") {
      return { ok: false as const, error: "Too many requests. Try again later." };
    }

    const { error } = await supabaseAdmin.from("profile_display_styles").upsert(
      { user_id: userId, style: data.style as ProfileDisplayStyle },
      { onConflict: "user_id" },
    );

    if (error) return { ok: false as const, error: error.message };

    if (data.style === "album") {
      await supabaseAdmin.from("album_layouts").upsert(
        { user_id: userId, layout: [], theme: {} },
        { onConflict: "user_id", ignoreDuplicates: true },
      );
    }

    return { ok: true as const, style: data.style };
  });

export const getAlbumDisplayStyleFn = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireAuthenticatedUserId();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data, error } = await supabaseAdmin
    .from("profile_display_styles")
    .select("style")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { style: "card" as ProfileDisplayStyle };
  return { style: (data?.style ?? "card") as ProfileDisplayStyle };
});

export const saveAlbumLayoutFn = createServerFn({ method: "POST" })
  .inputValidator(layoutSaveSchema)
  .handler(async ({ data }) => {
    const userId = await requireAuthenticatedUserId();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const allowed = await consumeRateLimit(
      supabaseAdmin,
      rateLimitBucket(["album-layout-save", userId, getClientIp()]),
      60,
      60,
    );
    if (allowed.kind === "denied") {
      return { ok: false as const, error: "Too many saves. Wait a moment." };
    }

    let payload;
    try {
      payload = parseAndSanitizeAlbumLayoutPayload(data);
    } catch {
      return { ok: false as const, error: "Invalid layout payload." };
    }

    const { error } = await supabaseAdmin.from("album_layouts").upsert(
      {
        user_id: userId,
        layout: payload.layout,
        theme: payload.theme ?? {},
      },
      { onConflict: "user_id" },
    );

    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const fetchAlbumLayoutFn = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireAuthenticatedUserId();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data, error } = await supabaseAdmin
    .from("album_layouts")
    .select("layout, theme, storage_bytes_used, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return { layout: [], theme: {}, storage_bytes_used: 0, updated_at: null };
  }

  return {
    layout: data.layout ?? [],
    theme: data.theme ?? {},
    storage_bytes_used: data.storage_bytes_used ?? 0,
    updated_at: data.updated_at,
  };
});

export const albumCheckConnectionConflictFn = createServerFn({ method: "POST" })
  .inputValidator(checkConflictInput)
  .handler(async ({ data }) => {
    const userId = await requireAuthenticatedUserId();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const conflict =
      data.type === "discord"
        ? await albumFindConnectionConflict(supabaseAdmin, userId, {
            type: "discord",
            discordUserId: data.discordUserId,
          })
        : data.type === "habbo"
          ? await albumFindConnectionConflict(supabaseAdmin, userId, {
              type: "habbo",
              username: data.username,
              hotelDomain: data.hotelDomain,
            })
          : await albumFindConnectionConflict(supabaseAdmin, userId, {
              type: "habblet",
              username: data.username,
            });

    return { hasConflict: Boolean(conflict) };
  });

function mapHotelVerifyError(code: string): string {
  switch (code) {
    case "user_not_found":
      return "Player not found.";
    case "code_not_found":
      return "The code was not found in your character's motto.";
    case "expired":
      return "The code expired. Generate a new one and try again.";
    case "waiting":
      return `Wait ${ALBUM_HOTEL_OTP_WAIT_SECONDS} seconds before validating.`;
    default:
      return "Validation failed. Try again in a moment.";
  }
}

export const albumVerifyHotelMottoFn = createServerFn({ method: "POST" })
  .inputValidator(verifyHotelMottoInput)
  .handler(async ({ data }) => {
    const userId = await requireAuthenticatedUserId();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const allowed = await consumeRateLimit(
      supabaseAdmin,
      rateLimitBucket(["album-hotel-verify", userId, getClientIp()]),
      15,
      60,
    );
    if (allowed.kind === "denied") {
      return { ok: false as const, error: "Too many validation attempts.", code: "rate_limited" as const };
    }

    const verified = await albumVerifyHotelOwnershipServer(
      data.platform,
      data.username,
      data.platform === "habbo" ? (data.hotelDomain ?? "com.br") : null,
      data.otp,
      data.unlockAt,
      data.expiresAt,
    );

    if (!verified.ok) {
      return { ok: false as const, error: mapHotelVerifyError(verified.error), code: verified.error };
    }

    return { ok: true as const, profile: verified.profile };
  });

export const albumLinkVerifiedConnectionFn = createServerFn({ method: "POST" })
  .inputValidator(linkConnectionInput)
  .handler(async ({ data }) => {
    const userId = await requireAuthenticatedUserId();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const result = await albumLinkVerifiedConnection({
      admin: supabaseAdmin,
      ownerId: userId,
      forceTransfer: data.forceTransfer === true,
      input: data,
    });

    if (!result.ok) {
      if ("needsTransfer" in result && result.needsTransfer) {
        return { ok: false as const, needsTransfer: true as const };
      }
      return {
        ok: false as const,
        needsTransfer: false as const,
        error: result.error,
        code: "code" in result ? result.code : undefined,
      };
    }

    const { error } = await supabaseAdmin.from("album_connections").upsert(
      { user_id: userId, ...result.patch },
      { onConflict: "user_id" },
    );

    if (error) return { ok: false as const, needsTransfer: false as const, error: error.message };
    return { ok: true as const };
  });

export const fetchAlbumPublicByUsernameFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ username: z.string().min(2).max(64) }))
  .handler(async ({ data }) => {
    const { fetchAlbumPublicProfile } = await import(
      "@/features/album/services/albumPublicService.server"
    );
    return fetchAlbumPublicProfile(data.username);
  });

const uploadMediaInput = z.object({
  blockId: z.string().uuid(),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().max(128),
  size: z.number().int().positive().max(ALBUM_VIDEO_MAX_BYTES_PREMIUM),
  base64: z.string().min(1).max(45_000_000),
  previousPath: z.string().max(512).optional(),
  previousBytes: z.number().int().nonnegative().optional(),
  isPremium: z.boolean().optional(),
});

const deleteMediaInput = z.object({
  storagePath: z.string().min(3).max(512),
  bytes: z.number().int().positive(),
});

const ALBUM_BUCKET = "album-media";

export const uploadAlbumMediaFn = createServerFn({ method: "POST" })
  .inputValidator(uploadMediaInput)
  .handler(async ({ data }) => {
    const userId = await requireAuthenticatedUserId();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const allowed = await consumeRateLimit(
      supabaseAdmin,
      rateLimitBucket(["album-media-upload", userId, getClientIp()]),
      30,
      60,
    );
    if (allowed.kind === "denied") {
      return { ok: false as const, error: "Too many uploads. Wait a moment." };
    }

    let buffer: Buffer;
    try {
      buffer = Buffer.from(data.base64, "base64");
    } catch {
      return { ok: false as const, error: "Invalid file payload." };
    }

    const validation = validateAlbumMediaBuffer(buffer, data.size, {
      isPremium: data.isPremium === true,
    });
    if (!validation.ok) return { ok: false as const, error: validation.error };

    const reserved = await albumReserveStorageBytes(supabaseAdmin, userId, buffer.length);
    if (!reserved) {
      return { ok: false as const, error: "Album storage quota exceeded." };
    }

    const storagePath = `${userId}/${data.blockId}/${Date.now()}.${validation.ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(ALBUM_BUCKET)
      .upload(storagePath, buffer, {
        contentType: validation.contentType,
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) {
      await albumReleaseStorageBytes(supabaseAdmin, userId, buffer.length);
      return { ok: false as const, error: uploadError.message };
    }

    if (data.previousPath && data.previousBytes && data.previousBytes > 0) {
      if (albumStoragePathOwnedByUser(userId, data.previousPath)) {
        await supabaseAdmin.storage.from(ALBUM_BUCKET).remove([data.previousPath]);
        await albumReleaseStorageBytes(supabaseAdmin, userId, data.previousBytes);
      }
    }

    const { data: publicData } = supabaseAdmin.storage.from(ALBUM_BUCKET).getPublicUrl(storagePath);

    return {
      ok: true as const,
      publicUrl: publicData.publicUrl,
      storagePath,
      bytes: buffer.length,
    };
  });

export const deleteAlbumMediaFn = createServerFn({ method: "POST" })
  .inputValidator(deleteMediaInput)
  .handler(async ({ data }) => {
    const userId = await requireAuthenticatedUserId();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (!albumStoragePathOwnedByUser(userId, data.storagePath)) {
      return { ok: false as const, error: "Invalid storage path." };
    }

    const { error } = await supabaseAdmin.storage.from(ALBUM_BUCKET).remove([data.storagePath]);
    if (error) return { ok: false as const, error: error.message };

    await albumReleaseStorageBytes(supabaseAdmin, userId, data.bytes);
    return { ok: true as const };
  });

const verifyDiscordInput = z.object({
  discordUserId: z.string().regex(/^\d{15,22}$/),
  otp: z.string().min(8).max(8),
  unlockAt: z.number(),
  expiresAt: z.number(),
});

export const albumVerifyDiscordFn = createServerFn({ method: "POST" })
  .inputValidator(verifyDiscordInput)
  .handler(async ({ data }) => {
    const userId = await requireAuthenticatedUserId();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const allowed = await consumeRateLimit(
      supabaseAdmin,
      rateLimitBucket(["album-discord-verify", userId, getClientIp()]),
      15,
      60,
    );
    if (allowed.kind === "denied") {
      return { ok: false as const, error: "Too many validation attempts.", code: "rate_limited" as const };
    }

    const verified = await albumVerifyDiscordOwnershipServer(
      data.discordUserId,
      data.otp,
      data.unlockAt,
      data.expiresAt,
    );

    if (!verified.ok) {
      return { ok: false as const, error: verified.error, code: verified.error };
    }

    return { ok: true as const };
  });
