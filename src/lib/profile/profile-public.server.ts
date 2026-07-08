import '@tanstack/react-start/server-only';

import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Server-only read of a public profile row (bypasses broken anon view grants). */
export async function fetchPublicProfileByUsername(
  username: string,
): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabaseAdmin
    .from("profiles_public")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.error("[fetchPublicProfileByUsername]", error.message);
    return null;
  }

  return (data as Record<string, unknown> | null) ?? null;
}
