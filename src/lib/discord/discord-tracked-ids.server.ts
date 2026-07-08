import '@tanstack/react-start/server-only';

/** Hardcoded showcase IDs on the homepage (not necessarily in profiles). */
export const DISCORD_SHOWCASE_USER_IDS = [
  "473259862210379777",
  "237746461419241473",
] as const;

export const DCDN_PROFILE_TTL_MS = 2 * 60 * 60 * 1000;

export async function listTrackedDiscordUserIds(): Promise<string[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("discord_user_id")
    .not("discord_user_id", "is", null);

  if (error) {
    console.warn("[listTrackedDiscordUserIds]", error.message);
  }

  const fromDb = (data ?? [])
    .map((row) => String(row.discord_user_id ?? "").trim())
    .filter((id) => /^\d{15,22}$/.test(id));

  return [...new Set([...fromDb, ...DISCORD_SHOWCASE_USER_IDS])];
}
