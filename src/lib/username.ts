import { checkUsernameTakenFn } from "@/lib/auth/auth.functions";
import { translate } from "@/i18n/LocaleProvider";

export const MIN_USERNAME_LENGTH = 2;
export const MAX_USERNAME_LENGTH = 30;

const USERNAME_PATTERN = new RegExp(
  `^[a-z0-9]{${MIN_USERNAME_LENGTH},${MAX_USERNAME_LENGTH}}$`,
);

/** Mantém só letras minúsculas e números. */
export function cleanUsername(raw: string) {
  return raw.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function isValidUsernameLength(username: string): boolean {
  const clean = cleanUsername(username);
  return clean.length >= MIN_USERNAME_LENGTH && clean.length <= MAX_USERNAME_LENGTH;
}

export function usernameLengthError(username: string): string | null {
  const clean = cleanUsername(username);
  if (clean.length < MIN_USERNAME_LENGTH) {
    return translate("lib.usernameMin", { min: MIN_USERNAME_LENGTH });
  }
  if (clean.length > MAX_USERNAME_LENGTH) {
    return translate("lib.usernameMax", { max: MAX_USERNAME_LENGTH });
  }
  if (!USERNAME_PATTERN.test(clean)) {
    return translate("lib.usernameChars");
  }
  return null;
}
