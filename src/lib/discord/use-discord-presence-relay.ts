import { useEffect, useRef } from "react";
import type { DiscordPresenceSlice } from "@/lib/discord/discord-payload";
import { getDiscordPresenceFn } from "@/lib/discord/discord.functions";

const POLL_FALLBACK_MS = 5000;

function presenceWsUrl(userId: string): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/api/discord/presence-ws?userId=${encodeURIComponent(userId)}`;
}

function presenceSseUrl(userId: string): string {
  return `/api/discord/presence-stream?userId=${encodeURIComponent(userId)}`;
}

type RelayHandle = {
  close: () => void;
};

function startPollFallback(
  userId: string,
  onPresence: (payload: DiscordPresenceSlice) => void,
): RelayHandle {
  let cancelled = false;

  const tick = async () => {
    if (cancelled) return;
    try {
      const data = await getDiscordPresenceFn({ data: { userId } });
      if (!cancelled && data) onPresence(data);
    } catch (error) {
      console.warn("[useDiscordPresenceRelay] poll fallback", error);
    }
  };

  void tick();
  const timer = window.setInterval(() => void tick(), POLL_FALLBACK_MS);
  return {
    close: () => {
      cancelled = true;
      window.clearInterval(timer);
    },
  };
}

function startSseRelay(
  userId: string,
  onPresence: (payload: DiscordPresenceSlice) => void,
  onFail: () => void,
): RelayHandle {
  let es: EventSource | null = null;
  try {
    es = new EventSource(presenceSseUrl(userId));
  } catch (error) {
    console.warn("[useDiscordPresenceRelay] EventSource failed", error);
    onFail();
    return { close: () => {} };
  }

  es.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data) as DiscordPresenceSlice;
      onPresence(payload);
    } catch (error) {
      console.warn("[useDiscordPresenceRelay] invalid SSE payload", error);
    }
  };

  es.onerror = () => {
    console.warn("[useDiscordPresenceRelay] SSE error, falling back to poll");
    es?.close();
    onFail();
  };

  return {
    close: () => {
      es?.close();
    },
  };
}

function startWsRelay(
  userId: string,
  onPresence: (payload: DiscordPresenceSlice) => void,
  onFail: () => void,
): RelayHandle {
  let ws: WebSocket | null = null;
  try {
    ws = new WebSocket(presenceWsUrl(userId));
  } catch (error) {
    console.warn("[useDiscordPresenceRelay] WebSocket failed", error);
    onFail();
    return { close: () => {} };
  }

  ws.onmessage = (event) => {
    try {
      const parsed = JSON.parse(String(event.data)) as {
        type?: string;
        data?: DiscordPresenceSlice;
      };
      if (parsed?.data) onPresence(parsed.data);
    } catch (error) {
      console.warn("[useDiscordPresenceRelay] invalid WS payload", error);
    }
  };

  ws.onerror = () => {
    console.warn("[useDiscordPresenceRelay] WS error, trying SSE");
    ws?.close();
    onFail();
  };

  ws.onclose = (event) => {
    if (!event.wasClean) {
      console.warn("[useDiscordPresenceRelay] WS closed unexpectedly, trying SSE");
      onFail();
    }
  };

  return {
    close: () => {
      ws?.close();
    },
  };
}

/**
 * Subscribes to Discord presence via our backend relay (WS → SSE → cached poll).
 * Never calls Lanyard/dcdn directly from the browser.
 */
export function useDiscordPresenceRelay(
  userId: string,
  onPresence: (payload: DiscordPresenceSlice) => void,
): void {
  const onPresenceRef = useRef(onPresence);
  onPresenceRef.current = onPresence;

  useEffect(() => {
    let active: RelayHandle | null = null;
    let poll: RelayHandle | null = null;
    let stopped = false;

    const deliver = (payload: DiscordPresenceSlice) => {
      onPresenceRef.current(payload);
    };

    const startPoll = () => {
      if (stopped || poll) return;
      poll = startPollFallback(userId, deliver);
    };

    const startSse = () => {
      if (stopped) return;
      active?.close();
      active = startSseRelay(userId, deliver, startPoll);
    };

    active = startWsRelay(userId, deliver, startSse);

    return () => {
      stopped = true;
      active?.close();
      poll?.close();
    };
  }, [userId]);
}
