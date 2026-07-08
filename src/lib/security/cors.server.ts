import { SITE_ORIGIN } from "@/lib/site";

const ALLOWED_ORIGINS = new Set([
  SITE_ORIGIN,
  "https://byosy.bio",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const CORS_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
const CORS_HEADERS = "Authorization, Content-Type, apikey, x-client-info";

export function isAllowedOrigin(origin: string | null): origin is string {
  return Boolean(origin && ALLOWED_ORIGINS.has(origin));
}

export function corsPreflightResponse(request: Request): Response | null {
  if (request.method !== "OPTIONS") return null;

  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin)) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": CORS_METHODS,
      "Access-Control-Allow-Headers": CORS_HEADERS,
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    },
  });
}

export function applyCorsHeaders(request: Request, headers: Headers): void {
  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin)) return;

  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Vary", "Origin");
}
