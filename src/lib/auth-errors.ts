import { AuthApiError } from "@supabase/supabase-js";
import { translate } from "@/i18n/LocaleProvider";

export type AuthNotice = { title: string; description?: string };

export function getAuthNotice(err: unknown): AuthNotice {
  if (err instanceof AuthApiError) {
    switch (err.code) {
      case "user_already_exists":
      case "email_exists":
        return {
          title: translate("lib.authEmailExists"),
          description: translate("lib.authEmailExistsDesc"),
        };
      case "invalid_credentials":
        return {
          title: translate("lib.authInvalidCredentials"),
          description: translate("lib.authInvalidCredentialsDesc"),
        };
      case "email_not_confirmed":
        return {
          title: translate("lib.authEmailNotConfirmed"),
          description: translate("lib.authEmailNotConfirmedDesc"),
        };
      case "weak_password":
        return {
          title: translate("lib.authWeakPassword"),
          description: translate("lib.authWeakPasswordDesc"),
        };
      case "signup_disabled":
        return {
          title: translate("lib.authSignupDisabled"),
          description: translate("lib.authSignupDisabledDesc"),
        };
      case "over_request_rate_limit":
        return {
          title: translate("lib.authRateLimit"),
          description: translate("lib.authRateLimitDesc"),
        };
      case "user_banned":
        return {
          title: translate("lib.authBanned"),
          description: translate("lib.authBannedDesc"),
        };
    }
  }

  const msg = err instanceof Error ? err.message : translate("lib.authFailed");

  if (/weak.?password|pwned/i.test(msg)) {
    return {
      title: translate("lib.authWeakPassword"),
      description: translate("lib.authWeakPasswordPwned"),
    };
  }
  if (/already.?registered|already.?exists|user.?already/i.test(msg)) {
    return {
      title: translate("lib.authEmailExists"),
      description: translate("lib.authEmailExistsDesc"),
    };
  }
  if (/invalid.?login|invalid.?credentials/i.test(msg)) {
    return {
      title: translate("lib.authInvalidCredentials"),
      description: translate("lib.authInvalidCredentialsDesc"),
    };
  }
  if (/email.?not.?confirmed/i.test(msg)) {
    return {
      title: translate("lib.authEmailNotConfirmed"),
      description: translate("lib.authEmailNotConfirmedDesc"),
    };
  }

  return { title: msg };
}

export function isExistingEmailSignup(user: { identities?: { id: string }[] } | null): boolean {
  return Boolean(user && (!user.identities || user.identities.length === 0));
}
