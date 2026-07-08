import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { ensureNodeWebSocket } from "./lib/ensure-node-websocket";
import { applySecurityToHtmlResponse, applySecurityToResponse } from "./lib/security/apply-security-response.server";
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
    try {
      const preflight = corsPreflightResponse(request);
      if (preflight) return preflight;

      await ensureNodeWebSocket();
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(request, response);
      return applySecurityToResponse(request, normalized);
    } catch (error) {
      console.error(error);
      return applySecurityToHtmlResponse(request, renderErrorPage(), { status: 500 });
    }
  },
};
