import '@tanstack/react-start/server-only';

import {
  extractPresenceFromLanyardEvent,
  extractPresenceMapFromInitState,
  publishPresence,
} from "@/lib/discord/presence-cache.server";
import { listTrackedDiscordUserIds } from "@/lib/discord/discord-tracked-ids.server";

const LANYARD_WS_URL = "wss://api.lanyard.rest/socket";
const RESUBSCRIBE_INTERVAL_MS = 5 * 60 * 1000;

let bridgeStarted = false;
let bridgeSocket: import("ws").WebSocket | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
let resubscribeTimer: ReturnType<typeof setInterval> | undefined;
let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
let reconnectAttempt = 0;
let subscribedIds: string[] = [];

function clearBridgeTimers(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = undefined;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = undefined;
  }
}

function sendInitialize(ws: import("ws").WebSocket, ids: string[]): void {
  if (ids.length === 0) return;
  ws.send(
    JSON.stringify({
      op: 2,
      d: { subscribe_to_ids: ids },
    }),
  );
}

function handleLanyardMessage(raw: string): void {
  let msg: {
    op?: number;
    t?: string;
    d?: unknown;
  };
  try {
    msg = JSON.parse(raw);
  } catch (error) {
    console.warn("[lanyard-bridge] invalid JSON", error);
    return;
  }

  if (msg.op === 1 && msg.d && typeof msg.d === "object") {
    const interval = Number((msg.d as { heartbeat_interval?: number }).heartbeat_interval ?? 30000);
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => {
      try {
        bridgeSocket?.send(JSON.stringify({ op: 3 }));
      } catch (error) {
        console.warn("[lanyard-bridge] heartbeat failed", error);
      }
    }, interval);
    if (typeof heartbeatTimer === "object" && "unref" in heartbeatTimer) {
      heartbeatTimer.unref();
    }
    if (bridgeSocket) sendInitialize(bridgeSocket, subscribedIds);
    return;
  }

  if (msg.op !== 0) return;

  if (msg.t === "INIT_STATE") {
    for (const entry of extractPresenceMapFromInitState(msg.d)) {
      void publishPresence(entry.userId, entry.presence);
    }
    return;
  }

  if (msg.t === "PRESENCE_UPDATE") {
    const parsed = extractPresenceFromLanyardEvent(msg.d);
    if (parsed) void publishPresence(parsed.userId, parsed.presence);
  }
}

async function refreshSubscribedIds(): Promise<void> {
  subscribedIds = await listTrackedDiscordUserIds();
  if (bridgeSocket && bridgeSocket.readyState === bridgeSocket.OPEN) {
    sendInitialize(bridgeSocket, subscribedIds);
  }
}

function scheduleReconnect(): void {
  clearBridgeTimers();
  try {
    bridgeSocket?.terminate();
  } catch {
    // ignore
  }
  bridgeSocket = null;
  const delay = Math.min(60_000, 1000 * 2 ** reconnectAttempt);
  reconnectAttempt += 1;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = undefined;
    void connectLanyardBridge();
  }, delay);
  if (typeof reconnectTimer === "object" && "unref" in reconnectTimer) {
    reconnectTimer.unref();
  }
}

async function connectLanyardBridge(): Promise<void> {
  if (bridgeSocket) return;

  await refreshSubscribedIds();

  try {
    await import("@/lib/ensure-node-websocket");
    const { default: WebSocket } = await import("ws");
    const ws = new WebSocket(LANYARD_WS_URL);
    bridgeSocket = ws;

    ws.on("message", (data) => {
      handleLanyardMessage(data.toString());
    });

    ws.on("close", () => {
      console.warn("[lanyard-bridge] disconnected");
      scheduleReconnect();
    });

    ws.on("error", () => {
      console.warn("[lanyard-bridge] socket error");
    });

    reconnectAttempt = 0;

    if (!resubscribeTimer) {
      resubscribeTimer = setInterval(() => {
        void refreshSubscribedIds();
      }, RESUBSCRIBE_INTERVAL_MS);
      if (typeof resubscribeTimer === "object" && "unref" in resubscribeTimer) {
        resubscribeTimer.unref();
      }
    }
  } catch (error) {
    console.warn("[lanyard-bridge] connect failed", error);
    scheduleReconnect();
  }
}

export function ensureLanyardBridge(): void {
  if (bridgeStarted) return;
  bridgeStarted = true;
  void connectLanyardBridge();
}
