import { supabase } from "@/integrations/supabase/client";

export const MIN_USERNAME_LENGTH = 2;
export const MAX_USERNAME_LENGTH = 30;

const USERNAME_PATTERN = new RegExp(
  `^[a-z0-9_]{${MIN_USERNAME_LENGTH},${MAX_USERNAME_LENGTH}}$`,
);

export function cleanUsername(raw: string) {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export function isValidUsernameLength(username: string): boolean {
  const clean = cleanUsername(username);
  return clean.length >= MIN_USERNAME_LENGTH && clean.length <= MAX_USERNAME_LENGTH;
}

export function usernameLengthError(username: string): string | null {
  const clean = cleanUsername(username);
  if (clean.length < MIN_USERNAME_LENGTH) {
    return `Use pelo menos ${MIN_USERNAME_LENGTH} letras, números ou _.`;
  }
  if (clean.length > MAX_USERNAME_LENGTH) {
    return `Use no máximo ${MAX_USERNAME_LENGTH} caracteres.`;
  }
  if (!USERNAME_PATTERN.test(clean)) {
    return `Use apenas letras minúsculas, números e _.`;
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
