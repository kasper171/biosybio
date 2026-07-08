import '@tanstack/react-start/server-only';

import type { DiscordPresenceSlice } from "@/lib/discord/discord-payload";

type Subscriber = {
  send: (payload: DiscordPresenceSlice) => void;
  close: () => void;
};

const subscribersByUser = new Map<string, Set<Subscriber>>();

export function getPresenceSubscriberCount(userId: string): number {
  return subscribersByUser.get(userId)?.size ?? 0;
}

export function subscribePresence(
  userId: string,
  subscriber: Subscriber,
): () => void {
  let set = subscribersByUser.get(userId);
  if (!set) {
    set = new Set();
    subscribersByUser.set(userId, set);
  }
  set.add(subscriber);
  return () => {
    set?.delete(subscriber);
    if (set && set.size === 0) subscribersByUser.delete(userId);
  };
}

export function broadcastPresence(userId: string, payload: DiscordPresenceSlice): void {
  const set = subscribersByUser.get(userId);
  if (!set || set.size === 0) return;
  for (const sub of set) {
    try {
      sub.send(payload);
    } catch (error) {
      console.warn("[broadcastPresence] subscriber error", userId, error);
      sub.close();
      set.delete(sub);
    }
  }
}
