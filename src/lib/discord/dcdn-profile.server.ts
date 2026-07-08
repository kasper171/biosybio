import '@tanstack/react-start/server-only';

import {
  parseDcdnPayload,
  type DiscordDcdnProfile,
} from "@/lib/discord/discord-payload";
import { DCDN_PROFILE_TTL_MS } from "@/lib/discord/discord-tracked-ids.server";

const DCDN_URL = "https://dcdn.dstn.to/profile";

export async function fetchDcdnProfileRemote(
  userId: string,
): Promise<DiscordDcdnProfile | null> {
  try {
    const res = await fetch(`${DCDN_URL}/${userId}`, { cache: "no-store" });
    if (!res.ok) {
      console.warn("[fetchDcdnProfileRemote]", userId, res.status);
      return null;
    }
    const json = await res.json();
    return parseDcdnPayload(json, userId);
  } catch (error) {
    console.warn("[fetchDcdnProfileRemote]", userId, error);
    return null;
  }
}

export async function writeDcdnProfileCache(
  userId: string,
  profile: DiscordDcdnProfile,
): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabaseAdmin as any;
  const { error } = await db.from("discord_dcdn_profile_cache").upsert({
    discord_user_id: userId,
    payload: profile,
    fetched_at: new Date().toISOString(),
  });
  if (error) console.warn("[writeDcdnProfileCache]", userId, error.message);
}

export async function readDcdnProfileCache(
  userId: string,
): Promise<{ profile: DiscordDcdnProfile; fetchedAt: number } | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabaseAdmin as any;
  const { data, error } = await db
    .from("discord_dcdn_profile_cache")
    .select("payload, fetched_at")
    .eq("discord_user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[readDcdnProfileCache]", userId, error.message);
    return null;
  }
  if (!data?.payload) return null;

  const profile = data.payload as DiscordDcdnProfile;
  const fetchedAt = new Date(String(data.fetched_at)).getTime();
  return { profile, fetchedAt };
}

export async function getDcdnProfileCached(userId: string): Promise<DiscordDcdnProfile | null> {
  const cached = await readDcdnProfileCache(userId);
  if (cached && Date.now() - cached.fetchedAt < DCDN_PROFILE_TTL_MS) {
    return cached.profile;
  }
  return cached?.profile ?? null;
}

export async function refreshDcdnProfile(userId: string): Promise<DiscordDcdnProfile | null> {
  const profile = await fetchDcdnProfileRemote(userId);
  if (profile) await writeDcdnProfileCache(userId, profile);
  return profile;
}
