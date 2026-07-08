import '@tanstack/react-start/server-only';

import {
  parseDcdnPayload,
  type DiscordDcdnProfile,
} from "@/lib/discord/discord-payload";
import { DCDN_PROFILE_TTL_MS } from "@/lib/discord/discord-tracked-ids.server";

const DCDN_URL = "https://dcdn.dstn.to/profile";

/** Fast per-instance cache; survives when Supabase table is missing. */
const memoryCache = new Map<string, { profile: DiscordDcdnProfile; fetchedAt: number }>();
const inflight = new Map<string, Promise<DiscordDcdnProfile | null>>();

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
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabaseAdmin as any;
    const { error } = await db.from("discord_dcdn_profile_cache").upsert({
      discord_user_id: userId,
      payload: profile,
      fetched_at: new Date().toISOString(),
    });
    if (error) console.warn("[writeDcdnProfileCache]", userId, error.message);
  } catch (error) {
    console.warn("[writeDcdnProfileCache]", userId, error);
  }
}

export async function readDcdnProfileCache(
  userId: string,
): Promise<{ profile: DiscordDcdnProfile; fetchedAt: number } | null> {
  try {
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
  } catch (error) {
    console.warn("[readDcdnProfileCache]", userId, error);
    return null;
  }
}

function readMemoryCache(userId: string): DiscordDcdnProfile | null {
  const entry = memoryCache.get(userId);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt >= DCDN_PROFILE_TTL_MS) return null;
  return entry.profile;
}

function writeMemoryCache(userId: string, profile: DiscordDcdnProfile): void {
  memoryCache.set(userId, { profile, fetchedAt: Date.now() });
}

/** Returns cached profile; fetches dcdn on server at most once per 2h per user. */
export async function resolveDcdnProfile(userId: string): Promise<DiscordDcdnProfile | null> {
  const fromMemory = readMemoryCache(userId);
  if (fromMemory) return fromMemory;

  const fromDb = await readDcdnProfileCache(userId);
  if (fromDb && Date.now() - fromDb.fetchedAt < DCDN_PROFILE_TTL_MS) {
    writeMemoryCache(userId, fromDb.profile);
    return fromDb.profile;
  }

  const stale = fromDb?.profile ?? memoryCache.get(userId)?.profile ?? null;

  const pending = inflight.get(userId);
  if (pending) return pending;

  const task = (async () => {
    const profile = await fetchDcdnProfileRemote(userId);
    if (profile) {
      writeMemoryCache(userId, profile);
      await writeDcdnProfileCache(userId, profile);
      return profile;
    }
    return stale;
  })();

  inflight.set(userId, task);
  try {
    return await task;
  } finally {
    inflight.delete(userId);
  }
}

/** @deprecated use resolveDcdnProfile */
export async function getDcdnProfileCached(userId: string): Promise<DiscordDcdnProfile | null> {
  return resolveDcdnProfile(userId);
}

export async function refreshDcdnProfile(userId: string): Promise<DiscordDcdnProfile | null> {
  const profile = await fetchDcdnProfileRemote(userId);
  if (profile) {
    writeMemoryCache(userId, profile);
    await writeDcdnProfileCache(userId, profile);
  }
  return profile;
}
