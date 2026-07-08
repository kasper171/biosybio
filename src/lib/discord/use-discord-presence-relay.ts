import { useEffect, useRef } from "react";
import {
  parseLanyardPresenceEvent,
  type DiscordPresenceSlice,
} from "@/lib/discord/discord-payload";

const LANYARD_WS_URL = "wss://api.lanyard.rest/socket";
const LANYARD_REST_URL = "https://api.lanyard.rest/v1/users";
const MAX_RECONNECT_MS = 60_000;

type LanyardWsMessage = {
  op?: number;
  t?: string;
  d?: unknown;
};

function parsePresenceFromInitState(data: unknown, userId: string): DiscordPresenceSlice | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  // subscribe_to_id → presence object directly
  if ("activities" in root || "spotify" in root || "discord_user" in root) {
    return parseLanyardPresenceEvent(data);
  }
  // subscribe_to_ids → map userId → presence
  const entry = root[userId];
  if (entry) return parseLanyardPresenceEvent(entry);
  return null;
}

function parsePresenceFromUpdate(data: unknown, userId: string): DiscordPresenceSlice | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  const eventUserId = String(root.user_id ?? "");
  if (eventUserId && eventUserId !== userId) return null;
  return parseLanyardPresenceEvent(data);
}

async function fetchLanyardPresenceRest(userId: string): Promise<DiscordPresenceSlice | null> {
  try {
    const res = await fetch(`${LANYARD_REST_URL}/${userId}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success) return null;
    return parseLanyardPresenceEvent(json.data);
  } catch (error) {
    console.warn("[useLanyardPresence] REST fallback failed", error);
    return null;
  }
}

/**
 * Presença em tempo real via WebSocket oficial do Lanyard (wss://api.lanyard.rest/socket).
 * Não usa endpoint próprio do Byosy — a Vercel não suporta WS customizado em serverless.
 */
export function useDiscordPresenceRelay(
  userId: string,
  onPresence: (payload: DiscordPresenceSlice) => void,
): void {
  const onPresenceRef = useRef(onPresence);
  onPresenceRef.current = onPresence;

  useEffect(() => {
    let ws: WebSocket | null = null;
    let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let reconnectAttempt = 0;
    let stopped = false;

    const clearTimers = () => {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = undefined;
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = undefined;
      }
    };

    const deliver = (payload: DiscordPresenceSlice) => {
      onPresenceRef.current(payload);
    };

    const handleMessage = (raw: string) => {
      let msg: LanyardWsMessage;
      try {
        msg = JSON.parse(raw);
      } catch (error) {
        console.warn("[useLanyardPresence] invalid JSON", error);
        return;
      }

      if (msg.op === 1 && msg.d && typeof msg.d === "object") {
        const interval = Number(
          (msg.d as { heartbeat_interval?: number }).heartbeat_interval ?? 30_000,
        );
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(() => {
          try {
            ws?.send(JSON.stringify({ op: 3 }));
          } catch (error) {
            console.warn("[useLanyardPresence] heartbeat failed", error);
          }
        }, interval);

        ws?.send(
          JSON.stringify({
            op: 2,
            d: { subscribe_to_id: userId },
          }),
        );
        return;
      }

      if (msg.op !== 0) return;

      if (msg.t === "INIT_STATE") {
        const presence = parsePresenceFromInitState(msg.d, userId);
        if (presence) deliver(presence);
        return;
      }

      if (msg.t === "PRESENCE_UPDATE") {
        const presence = parsePresenceFromUpdate(msg.d, userId);
        if (presence) deliver(presence);
      }
    };

    const scheduleReconnect = () => {
      if (stopped) return;
      clearTimers();
      const delay = Math.min(MAX_RECONNECT_MS, 1000 * 2 ** reconnectAttempt);
      reconnectAttempt += 1;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = undefined;
        connect();
      }, delay);
    };

    const connect = () => {
      if (stopped) return;
      try {
        ws = new WebSocket(LANYARD_WS_URL);
      } catch (error) {
        console.warn("[useLanyardPresence] WebSocket open failed", error);
        void fetchLanyardPresenceRest(userId).then((p) => {
          if (p) deliver(p);
        });
        scheduleReconnect();
        return;
      }

      ws.onmessage = (event) => handleMessage(String(event.data));

      ws.onopen = () => {
        reconnectAttempt = 0;
      };

      ws.onerror = () => {
        console.warn("[useLanyardPresence] WebSocket error");
      };

      ws.onclose = () => {
        console.warn("[useLanyardPresence] WebSocket closed, reconnecting");
        scheduleReconnect();
      };
    };

    connect();

    return () => {
      stopped = true;
      clearTimers();
      try {
        ws?.close();
      } catch {
        // ignore
      }
      ws = null;
    };
  }, [userId]);
}
