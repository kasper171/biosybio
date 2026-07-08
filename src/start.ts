import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { ensureNodeWebSocket } from "./lib/ensure-node-websocket";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { applySecurityToResponse, applySecurityToHtmlResponse } from "@/lib/security/apply-security-response.server";
import { runWithCspNonce } from "@/lib/security/csp-context.server";
import { corsPreflightResponse } from "@/lib/security/cors.server";

const nodeWebSocketMiddleware = createMiddleware().server(async ({ next }) => {
  await ensureNodeWebSocket();
  return next();
});

const securityHeadersMiddleware = createMiddleware().server(async ({ request, next }) => {
  const preflight = corsPreflightResponse(request);
  if (preflight) return preflight;

  return runWithCspNonce(async () => {
    const response = await next();
    return applySecurityToResponse(request, response);
  });
});

const errorMiddleware = createMiddleware().server(async ({ request, next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return applySecurityToHtmlResponse(request, renderErrorPage(), { status: 500 });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [nodeWebSocketMiddleware, securityHeadersMiddleware, errorMiddleware],
}));
