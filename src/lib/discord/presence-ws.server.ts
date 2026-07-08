import '@tanstack/react-start/server-only';

import type { DiscordPresenceSlice } from "@/lib/discord/discord-payload";
import { readPresenceCache } from "@/lib/discord/presence-cache.server";
import { subscribePresence } from "@/lib/discord/presence-hub.server";

type ClientSocket = {
  send: (data: string) => void;
  readyState: number;
  close: () => void;
};

const OPEN = 1;
const clientsByUser = new Map<string, Set<ClientSocket>>();
const hubUnsubs = new Map<string, () => void>();

function ensureHubRelay(userId: string): void {
  if (hubUnsubs.has(userId)) return;
  const unsub = subscribePresence(userId, {
    send: (payload) => broadcastToWsClients(userId, payload),
    close: () => {},
  });
  hubUnsubs.set(userId, unsub);
}

function broadcastToWsClients(userId: string, payload: DiscordPresenceSlice): void {
  const set = clientsByUser.get(userId);
  if (!set) return;
  const msg = JSON.stringify({ type: "presence", data: payload });
  for (const ws of set) {
    if (ws.readyState !== OPEN) continue;
    try {
      ws.send(msg);
    } catch (error) {
      console.warn("[presence-ws] send failed", userId, error);
    }
  }
}

export async function registerPresenceWsClient(
  userId: string,
  ws: ClientSocket,
): Promise<() => void> {
  let set = clientsByUser.get(userId);
  if (!set) {
    set = new Set();
    clientsByUser.set(userId, set);
  }
  set.add(ws);
  ensureHubRelay(userId);

  const cached = await readPresenceCache(userId);
  if (cached && ws.readyState === OPEN) {
    ws.send(JSON.stringify({ type: "presence", data: cached }));
  }

  return () => {
    set?.delete(ws);
    if (set && set.size === 0) {
      clientsByUser.delete(userId);
      const unsub = hubUnsubs.get(userId);
      unsub?.();
      hubUnsubs.delete(userId);
    }
  };
}
