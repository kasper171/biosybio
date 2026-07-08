import { supabase } from "@/integrations/supabase/client";

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
    return `Use at least ${MIN_USERNAME_LENGTH} letters or numbers.`;
  }
  if (clean.length > MAX_USERNAME_LENGTH) {
    return `Use at most ${MAX_USERNAME_LENGTH} characters.`;
  }
  if (!USERNAME_PATTERN.test(clean)) {
    return "Use only lowercase letters and numbers (no symbols).";
  }
  return null;
}

export async function isUsernameTaken(username: string) {
  const clean = cleanUsername(username);
  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", clean)
    .maybeSingle();

  if (error) throw error;
  return { clean, taken: Boolean(data) };
}
