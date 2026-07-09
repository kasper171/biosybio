import { getRequest } from "@tanstack/react-start/server";

export function getClientIp(): string {
  const request = getRequest();
  if (!request) return "unknown";

  const candidates = [
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-real-ip"),
    request.headers.get("x-vercel-forwarded-for"),
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  ];

  for (const raw of candidates) {
    const ip = raw?.trim();
    if (ip) return ip.slice(0, 64);
  }

  return "unknown";
}
