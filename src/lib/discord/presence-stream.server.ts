import '@tanstack/react-start/server-only';

import type { DiscordPresenceSlice } from "@/lib/discord/discord-payload";
import { readPresenceCache } from "@/lib/discord/presence-cache.server";
import { subscribePresence } from "@/lib/discord/presence-hub.server";

const encoder = new TextEncoder();

export function createPresenceSseResponse(userId: string): Response {
  let unsubscribe: (() => void) | undefined;
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: DiscordPresenceSlice) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      const cached = await readPresenceCache(userId);
      if (cached) send(cached);

      unsubscribe = subscribePresence(userId, {
        send,
        close: () => {
          if (closed) return;
          closed = true;
          try {
            controller.close();
          } catch {
            // already closed
          }
        },
      });
    },
    cancel() {
      closed = true;
      unsubscribe?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Connection: "keep-alive",
    },
  });
}
