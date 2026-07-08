import '@tanstack/react-start/server-only';

import { applyCorsHeaders } from "@/lib/security/cors.server";
import {
  buildContentSecurityPolicy,
  createCspNonce,
  injectNonceIntoHtml,
} from "@/lib/security/csp.server";
import { getCspNonce } from "@/lib/security/csp-context.server";
import { applyStaticSecurityHeaders } from "@/lib/security/security-headers";

/**
 * Applies security headers without replacing the response body.
 * TanStack Start SSR streams HTML; `new Response(response.body)` or `response.text()`
 * can yield an empty body (white screen).
 */
export async function applySecurityToResponse(
  request: Request,
  response: Response,
): Promise<Response> {
  if (!(response instanceof Response)) return response;

  const headerBag = response.headers;
  if (headerBag && typeof headerBag.set === "function") {
    applyStaticSecurityHeaders(headerBag);
    applyCorsHeaders(request, headerBag);

    const nonce = getCspNonce();
    if (nonce) {
      headerBag.set("Content-Security-Policy", buildContentSecurityPolicy(nonce));
    }
  }

  return response;
}

export function applySecurityToHtmlResponse(
  request: Request,
  html: string,
  init?: ResponseInit,
): Response {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type")) {
    headers.set("content-type", "text/html; charset=utf-8");
  }

  applyStaticSecurityHeaders(headers);
  applyCorsHeaders(request, headers);

  const nonce = getCspNonce() ?? createCspNonce();
  headers.set("Content-Security-Policy", buildContentSecurityPolicy(nonce));

  return new Response(injectNonceIntoHtml(html, nonce), {
    ...init,
    headers,
  });
}
