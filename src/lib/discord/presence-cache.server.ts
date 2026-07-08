import '@tanstack/react-start/server-only';

import type { DiscordPresenceSlice } from "@/lib/discord/discord-payload";
import { parseLanyardPresenceEvent } from "@/lib/discord/discord-payload";
import { broadcastPresence } from "@/lib/discord/presence-hub.server";

export async function writePresenceCache(
  userId: string,
  payload: DiscordPresenceSlice,
): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabaseAdmin as any;
  const { error } = await db.from("discord_presence_cache").upsert({
    discord_user_id: userId,
    payload,
    updated_at: new Date().toISOString(),
  });
  if (error) console.warn("[writePresenceCache]", userId, error.message);
}

export async function readPresenceCache(userId: string): Promise<DiscordPresenceSlice | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabaseAdmin as any;
  const { data, error } = await db
    .from("discord_presence_cache")
    .select("payload")
    .eq("discord_user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[readPresenceCache]", userId, error.message);
    return null;
  }
  if (!data?.payload) return null;
  return data.payload as DiscordPresenceSlice;
}

export async function publishPresence(
  userId: string,
  payload: DiscordPresenceSlice,
): Promise<void> {
  await writePresenceCache(userId, payload);
  broadcastPresence(userId, payload);
}

export function extractPresenceFromLanyardEvent(data: unknown): {
  userId: string;
  presence: DiscordPresenceSlice;
} | null {
  const root = data as Record<string, unknown>;
  const userId = String(root.user_id ?? root.discord_user?.id ?? "");
  if (!/^\d{15,22}$/.test(userId)) return null;
  return { userId, presence: parseLanyardPresenceEvent(data) };
}

export function extractPresenceMapFromInitState(
  data: unknown,
): Array<{ userId: string; presence: DiscordPresenceSlice }> {
  if (!data || typeof data !== "object") return [];
  const entries: Array<{ userId: string; presence: DiscordPresenceSlice }> = [];
  for (const [userId, value] of Object.entries(data as Record<string, unknown>)) {
    if (!/^\d{15,22}$/.test(userId)) continue;
    entries.push({ userId, presence: parseLanyardPresenceEvent(value) });
  }
  return entries;
}
