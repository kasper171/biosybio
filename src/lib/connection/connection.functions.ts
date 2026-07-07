import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { findConnectionConflict } from "@/lib/connection/connection-linking.server";
import { linkVerifiedConnection } from "@/lib/connection/connection-linking.server";
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
        error: "Não foi possível salvar a conexão. Tente novamente.",
      };
    }

    return { ok: true as const, patch: result.patch };
  });
