import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { ensureNodeWebSocket } from "./lib/ensure-node-websocket";
import { ensureDiscordServicesStarted } from "./lib/discord/discord-services.server";
import { createPresenceSseResponse } from "./lib/discord/presence-stream.server";
import {
  applySecurityToHtmlResponse,
  applySecurityToResponse,
} from "./lib/security/apply-security-response.server";
import { runWithCspNonce } from "./lib/security/csp-context.server";
import { corsPreflightResponse } from "./lib/security/cors.server";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(
  request: Request,
  response: Response,
): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return applySecurityToHtmlResponse(request, renderErrorPage(), { status: 500 });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    return runWithCspNonce(async (cspNonce) => {
      try {
        const preflight = corsPreflightResponse(request);
        if (preflight) return preflight;

        await ensureNodeWebSocket();
        ensureDiscordServicesStarted();

        const url = new URL(request.url);
        if (url.pathname === "/api/discord/presence-stream") {
          const userId = url.searchParams.get("userId")?.trim() ?? "";
          if (!/^\d{15,22}$/.test(userId)) {
            return new Response("Invalid userId", { status: 400 });
          }
          const streamResponse = createPresenceSseResponse(userId);
          return applySecurityToResponse(request, streamResponse, cspNonce);
        }

        const handler = await getServerEntry();
        const response = await handler.fetch(request, env, ctx);
        const normalized = await normalizeCatastrophicSsrResponse(request, response);
        return applySecurityToResponse(request, normalized, cspNonce);
      } catch (error) {
        console.error(error);
        return applySecurityToHtmlResponse(request, renderErrorPage(), { status: 500 });
      }
    });
  },
};
