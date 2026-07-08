import type { Plugin, ViteDevServer } from "vite";
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";

let wssPromise: Promise<import("ws").WebSocketServer> | undefined;

async function getWss(): Promise<import("ws").WebSocketServer> {
  if (!wssPromise) {
    wssPromise = import("ws").then(({ WebSocketServer }) => {
      return new WebSocketServer({ noServer: true });
    });
  }
  return wssPromise;
}

function parseUserId(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url, "http://localhost");
    const userId = parsed.searchParams.get("userId")?.trim() ?? "";
    return /^\d{15,22}$/.test(userId) ? userId : null;
  } catch {
    return null;
  }
}

async function attachUpgrade(server: ViteDevServer): Promise<void> {
  const httpServer = server.httpServer;
  if (!httpServer) return;

  httpServer.on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    if (!req.url?.startsWith("/api/discord/presence-ws")) return;

    void (async () => {
      const userId = parseUserId(req.url);
      if (!userId) {
        socket.destroy();
        return;
      }

      const { registerPresenceWsClient } = await import("@/lib/discord/presence-ws.server");
      const { ensureDiscordServicesStarted } = await import("@/lib/discord/discord-services.server");
      ensureDiscordServicesStarted();

      const wss = await getWss();
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
        void registerPresenceWsClient(userId, ws).then((unregister) => {
          ws.on("close", () => unregister());
        });
      });
    })();
  });
}

export function discordPresenceWsPlugin(): Plugin {
  return {
    name: "byosy-discord-presence-ws",
    configureServer(server) {
      void attachUpgrade(server);
    },
  };
}
