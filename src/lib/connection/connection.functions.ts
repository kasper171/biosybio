import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { HOTEL_OTP_WAIT_SECONDS } from "@/lib/hotel-verify";
import { findConnectionConflict } from "@/lib/connection/connection-linking.server";
import { linkVerifiedConnection } from "@/lib/connection/connection-linking.server";
import { verifyHotelOwnershipServer } from "@/lib/connection-verify.server";
import { requireAuthenticatedUserId } from "@/lib/require-auth.server";

const otpFields = {
  otp: z.string().min(8).max(8),
  unlockAt: z.number(),
  expiresAt: z.number(),
  forceTransfer: z.boolean().optional(),
};

const checkConflictInput = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("discord"),
    discordUserId: z.string().regex(/^\d{15,22}$/),
  }),
  z.object({
    type: z.literal("habbo"),
    username: z.string().min(2).max(64),
    hotelDomain: z.string().min(2).max(32),
  }),
  z.object({
    type: z.literal("habblet"),
    username: z.string().min(2).max(64),
  }),
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
  z.object({
    type: z.literal("discord"),
    discordUserId: z.string().regex(/^\d{15,22}$/),
    ...otpFields,
  }),
  z.object({
    type: z.literal("habbo"),
    username: z.string().min(2).max(64),
    hotelDomain: z.string().min(2).max(32),
    ...otpFields,
  }),
  z.object({
    type: z.literal("habblet"),
    username: z.string().min(2).max(64),
    ...otpFields,
  }),
]);

export const checkConnectionConflictFn = createServerFn({ method: "POST" })
  .inputValidator(checkConflictInput)
  .handler(async ({ data }) => {
    const userId = await requireAuthenticatedUserId();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const conflict =
      data.type === "discord"
        ? await findConnectionConflict(supabaseAdmin, userId, {
            type: "discord",
            discordUserId: data.discordUserId,
          })
        : data.type === "habbo"
          ? await findConnectionConflict(supabaseAdmin, userId, {
              type: "habbo",
              username: data.username,
              hotelDomain: data.hotelDomain,
            })
          : await findConnectionConflict(supabaseAdmin, userId, {
              type: "habblet",
              username: data.username,
            });

    return { hasConflict: Boolean(conflict) };
  });

function mapHotelVerifyError(code: string): string {
  switch (code) {
    case "invalid_username":
      return "Invalid player name.";
    case "invalid_hotel":
      return "Invalid hotel.";
    case "user_not_found":
      return "Player not found.";
    case "code_not_found":
      return "The code was not found in your character's motto.";
    case "expired":
      return "The code expired. Generate a new one and try again.";
    case "waiting":
      return `Wait ${HOTEL_OTP_WAIT_SECONDS} seconds before validating.`;
    default:
      return "Validation failed. Try again in a moment.";
  }
}

/** Segunda chamada à API do hotel: lê a missão atualizada e confere o código OTP. */
export const verifyHotelMottoFn = createServerFn({ method: "POST" })
  .inputValidator(verifyHotelMottoInput)
  .handler(async ({ data }) => {
    await requireAuthenticatedUserId();

    const verified = await verifyHotelOwnershipServer(
      data.platform,
      data.username,
      data.platform === "habbo" ? (data.hotelDomain ?? "com.br") : null,
      data.otp,
      data.unlockAt,
      data.expiresAt,
    );

    if (!verified.ok) {
      return {
        ok: false as const,
        error: mapHotelVerifyError(verified.error),
        code: verified.error,
      };
    }

    return { ok: true as const, profile: verified.profile };
  });

export const linkVerifiedConnectionFn = createServerFn({ method: "POST" })
  .inputValidator(linkConnectionInput)
  .handler(async ({ data }) => {
    const userId = await requireAuthenticatedUserId();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const result = await linkVerifiedConnection({
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

    const { error } = await supabaseAdmin
      .from("profiles")
      .update(result.patch)
      .eq("id", userId);

    if (error) {
      return {
        ok: false as const,
        needsTransfer: false as const,
        error: "Could not save the connection. Try again.",
      };
    }

    return { ok: true as const, patch: result.patch };
  });
