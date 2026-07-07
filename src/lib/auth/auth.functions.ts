import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { passwordPolicyError } from "@/lib/auth/password-policy";
import { cleanUsername, usernameLengthError } from "@/lib/username";

const signUpInput = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  username: z.string().min(2).max(64),
});

export type SignUpErrorCode =
  | "invalid_username"
  | "weak_password"
  | "username_taken"
  | "email_exists"
  | "signup_failed"
  | "server_misconfigured";

export const signUpFn = createServerFn({ method: "POST" })
  .inputValidator(signUpInput)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const cleanUser = cleanUsername(data.username);

    const lengthError = usernameLengthError(cleanUser);
    if (lengthError) {
      return { ok: false as const, error: lengthError, code: "invalid_username" as const };
    }

    const passwordError = passwordPolicyError(data.password);
    if (passwordError) {
      return { ok: false as const, error: passwordError, code: "weak_password" as const };
    }

    let supabaseAdmin: Awaited<
      typeof import("@/integrations/supabase/client.server")
    >["supabaseAdmin"];
    try {
      ({ supabaseAdmin } = await import("@/integrations/supabase/client.server"));
    } catch {
      return {
        ok: false as const,
        error: "Servidor de cadastro não configurado. Tente novamente em instantes.",
        code: "server_misconfigured" as const,
      };
    }

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", cleanUser)
      .maybeSingle();

    if (existingProfile) {
      return {
        ok: false as const,
        error:
          "Este nome de usuário já está em uso. Se você tentou criar agora, use Entrar com seu email.",
        code: "username_taken" as const,
        tryLogin: true as const,
      };
    }

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
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
          error:
            "Este email já está cadastrado. Se você tentou criar agora, use Entrar com este email e senha.",
          code: "email_exists" as const,
          tryLogin: true as const,
        };
      }
      if (msg.includes("weak") || msg.includes("pwned")) {
        return {
          ok: false as const,
          error: "Senha fraca ou já vazada. Escolha outra senha.",
          code: "weak_password" as const,
        };
      }
      console.error("[signUpFn]", error.message);
      return {
        ok: false as const,
        error: "Não foi possível criar a conta. Tente novamente em instantes.",
        code: "signup_failed" as const,
      };
    }

    return {
      ok: true as const,
      userId: created.user?.id ?? null,
    };
  });
