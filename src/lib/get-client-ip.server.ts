import { getRequest } from "@tanstack/react-start/server";

export function getClientIp(): string {
  const request = getRequest();
  if (!request) return "unknown";

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 64);

  return "unknown";
}
