import { supabase } from "@/integrations/supabase/client";

export function cleanUsername(raw: string) {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
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
