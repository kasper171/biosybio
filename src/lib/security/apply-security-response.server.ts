import { applyCorsHeaders } from "@/lib/security/cors.server";
import {
  buildContentSecurityPolicy,
  createCspNonce,
  injectNonceIntoHtml,
} from "@/lib/security/csp.server";
import { applyStaticSecurityHeaders } from "@/lib/security/security-headers";

export async function applySecurityToResponse(
  request: Request,
  response: Response,
): Promise<Response> {
  const headers = new Headers(response.headers);
  applyStaticSecurityHeaders(headers);
  applyCorsHeaders(request, headers);

  const contentType = headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const nonce = createCspNonce();
  const html = injectNonceIntoHtml(await response.text(), nonce);
  headers.set("Content-Security-Policy", buildContentSecurityPolicy(nonce));

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
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

  const nonce = createCspNonce();
  headers.set("Content-Security-Policy", buildContentSecurityPolicy(nonce));

  return new Response(injectNonceIntoHtml(html, nonce), {
    ...init,
    headers,
  });
}
