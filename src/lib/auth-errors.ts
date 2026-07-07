import { AuthApiError } from "@supabase/supabase-js";

export type AuthNotice = { title: string; description?: string };

export function getAuthNotice(err: unknown): AuthNotice {
  if (err instanceof AuthApiError) {
    switch (err.code) {
      case "user_already_exists":
      case "email_exists":
        return {
          title: "This email is already registered",
          description: "Try signing in or use a different email.",
        };
      case "invalid_credentials":
        return {
          title: "Incorrect email or password",
          description: "Check your details and try again.",
        };
      case "email_not_confirmed":
        return {
          title: "Confirm your email",
          description: "Open the link sent to your inbox before signing in.",
        };
      case "weak_password":
        return {
          title: "Weak password",
          description: "Choose a stronger password that has not appeared in public data breaches.",
        };
      case "signup_disabled":
        return {
          title: "Sign-up unavailable",
          description: "New registrations are temporarily disabled.",
        };
      case "over_request_rate_limit":
        return {
          title: "Too many attempts",
          description: "Wait a few minutes and try again.",
        };
      case "user_banned":
        return {
          title: "Account suspended",
          description: "Contact support if you believe this is a mistake.",
        };
    }
  }

  const msg = err instanceof Error ? err.message : "Authentication failed";

  if (/weak.?password|pwned/i.test(msg)) {
    return {
      title: "Weak password",
      description: "This password appeared in public data breaches. Choose another one.",
    };
  }
  if (/already.?registered|already.?exists|user.?already/i.test(msg)) {
    return {
      title: "This email is already registered",
      description: "Try signing in or use a different email.",
    };
  }
  if (/invalid.?login|invalid.?credentials/i.test(msg)) {
    return {
      title: "Incorrect email or password",
      description: "Check your details and try again.",
    };
  }
  if (/email.?not.?confirmed/i.test(msg)) {
    return {
      title: "Confirm your email",
      description: "Open the link sent to your inbox before signing in.",
    };
  }

  return { title: msg };
}

export function isExistingEmailSignup(user: { identities?: { id: string }[] } | null): boolean {
  return Boolean(user && (!user.identities || user.identities.length === 0));
}
