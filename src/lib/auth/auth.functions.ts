import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getTurnstileSecretKey } from "@/lib/turnstile/config.server";
import { getTurnstileUserMessage } from "@/lib/turnstile/errors";
import { verifyTurnstileToken } from "@/lib/turnstile/verify.server";
import { cleanUsername, usernameLengthError } from "@/lib/username";

const signUpInput = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  username: z.string().min(2).max(64),
  turnstileToken: z.string().min(1).optional(),
});

function isTurnstileRequiredOnServer(): boolean {
  return Boolean(
    getTurnstileSecretKey() || process.env.VITE_TURNSTILE_SITE_KEY?.trim(),
  );
}

export const signUpWithTurnstileFn = createServerFn({ method: "POST" })
  .inputValidator(signUpInput)
  .handler(async ({ data }) => {
    const cleanUser = cleanUsername(data.username);
    const lengthError = usernameLengthError(cleanUser);
    if (lengthError) {
      return { ok: false as const, error: lengthError, code: "invalid_username" as const };
    }

    if (data.turnstileToken?.trim()) {
      const verified = await verifyTurnstileToken(data.turnstileToken.trim());
      if (!verified.ok) {
        return {
          ok: false as const,
          error: getTurnstileUserMessage(verified.code),
          code: verified.code,
        };
      }
    } else if (isTurnstileRequiredOnServer()) {
      return {
        ok: false as const,
        error: "Marque o check de segurança antes de criar a conta.",
        code: "captcha_required" as const,
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", cleanUser)
      .maybeSingle();

    if (existingProfile) {
      return {
        ok: false as const,
        error: "Este nome de usuário já está em uso.",
        code: "username_taken" as const,
      };
    }

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email.trim(),
      password: data.password,
      // Com confirmação de email desligada no Supabase, o usuário deve entrar direto.
      email_confirm: true,
      user_metadata: {
        username: cleanUser,
        display_name: cleanUser,
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        return {
          ok: false as const,
          error: "Este email já está cadastrado.",
          code: "email_exists" as const,
        };
      }
      if (msg.includes("weak") || msg.includes("pwned")) {
        return {
          ok: false as const,
          error: "Senha fraca ou já vazada. Escolha outra senha.",
          code: "weak_password" as const,
        };
      }
      console.error("[signUpWithTurnstileFn]", error.message);
      return {
        ok: false as const,
        error: "Não foi possível criar a conta. Tente novamente em instantes.",
        code: "signup_failed" as const,
      };
    }

    return {
      ok: true as const,
      needsEmailConfirmation: false,
      userId: created.user?.id ?? null,
    };
  });
