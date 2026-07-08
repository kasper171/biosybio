import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { passwordPolicyError } from "@/lib/auth/password-policy";
import { cleanUsername, usernameLengthError } from "@/lib/username";
import { getClientIp } from "@/lib/get-client-ip.server";
import { consumeRateLimit, rateLimitBucket } from "@/lib/rate-limit.server";
import { writeAuditLog } from "@/lib/audit-log.server";

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
    const clientIp = getClientIp();

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
        error: "Sign-up server is not configured. Try again in a moment.",
        code: "server_misconfigured" as const,
      };
    }

    const ipAllowed = await consumeRateLimit(
      supabaseAdmin,
      rateLimitBucket(["signup", "ip", clientIp]),
      5,
      3600,
    );
    if (!ipAllowed) {
      await writeAuditLog({
        action: "signup_rate_limited",
        metadata: { email, username: cleanUser },
      });
      return {
        ok: false as const,
        error: "Too many sign-up attempts. Try again later.",
        code: "signup_failed" as const,
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
          "This username is already taken. If you just tried to sign up, sign in with your email.",
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
            "This email is already registered. If you just tried to sign up, sign in with this email and password.",
          code: "email_exists" as const,
          tryLogin: true as const,
        };
      }
      if (msg.includes("weak") || msg.includes("pwned")) {
        return {
          ok: false as const,
          error: "Weak or leaked password. Choose another password.",
          code: "weak_password" as const,
        };
      }
      console.error("[signUpFn]", error.message);
      return {
        ok: false as const,
        error: "Could not create the account. Try again in a moment.",
        code: "signup_failed" as const,
      };
    }

    await writeAuditLog({
      action: "signup_success",
      actorId: created.user?.id ?? null,
      metadata: { username: cleanUser },
    });

    return {
      ok: true as const,
      userId: created.user?.id ?? null,
    };
  });