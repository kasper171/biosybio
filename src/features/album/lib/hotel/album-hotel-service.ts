import type { AlbumHotelFetchResult, AlbumHotelProfileData } from "@/features/album/lib/hotel/album-hotel.types";

const HABBO_DOMAINS = new Set(["com", "com.br", "es", "fi", "fr", "de", "it", "nl", "com.tr"]);

function normalizeHabboDomain(domain: string): string {
  const d = domain.trim().toLowerCase().replace(/^\.+|\.+$/g, "");
  return d || "com.br";
}

function headers(fresh?: boolean): HeadersInit {
  return {
    Accept: "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    ...(fresh ? { "X-Album-Fetch": String(Date.now()) } : {}),
  };
}

export async function albumFetchHabboProfile(
  username: string,
  hotelDomain: string,
  options?: { fresh?: boolean },
): Promise<AlbumHotelFetchResult> {
  const name = username.trim();
  if (!name) return { ok: false, error: "invalid_username" };

  const domain = normalizeHabboDomain(hotelDomain);
  if (!HABBO_DOMAINS.has(domain)) return { ok: false, error: "invalid_hotel" };

  const url = `https://www.habbo.${domain}/api/public/users?name=${encodeURIComponent(name)}`;
  try {
    const response = await fetch(url, { cache: "no-store", headers: headers(options?.fresh), signal: AbortSignal.timeout(12000) });
    if (response.status === 404) return { ok: false, error: "user_not_found" };
    if (!response.ok) return { ok: false, error: "service_unavailable" };
    const payload = await response.json();
    const user = Array.isArray(payload) ? payload[0] : payload;
    if (!user?.name || !user.figureString) return { ok: false, error: "user_not_found" };
    const data: AlbumHotelProfileData = {
      platform: "habbo",
      username: user.name,
      figure: user.figureString,
      motto: user.motto ?? null,
      level: user.currentLevel ?? null,
      hotelDomain: domain,
    };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "service_unavailable" };
  }
}

export async function albumFetchHabbletProfile(
  username: string,
  options?: { fresh?: boolean },
): Promise<AlbumHotelFetchResult> {
  const name = username.trim();
  if (!name) return { ok: false, error: "invalid_username" };

  const url = `https://habblet.city/api/public/users?name=${encodeURIComponent(name)}`;
  try {
    const response = await fetch(url, { cache: "no-store", headers: headers(options?.fresh), signal: AbortSignal.timeout(12000) });
    if (response.status === 404) return { ok: false, error: "user_not_found" };
    if (!response.ok) return { ok: false, error: "service_unavailable" };
    const payload = await response.json();
    const user = Array.isArray(payload) ? payload[0] : payload;
    if (!user?.name || !user.figureString) return { ok: false, error: "user_not_found" };
    const data: AlbumHotelProfileData = {
      platform: "habblet",
      username: user.name,
      figure: user.figureString,
      motto: user.motto ?? null,
      achievementPoints: user.achievementScore ?? user.achievementPoints ?? null,
    };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "service_unavailable" };
  }
}

export function albumHabboAvatarUrl(figure: string, domain = "com.br"): string {
  return `https://www.habbo.${domain}/habbo-imaging/avatarimage?figure=${encodeURIComponent(figure)}&direction=2&head_direction=2&gesture=sml&size=l`;
}

export function albumHabbletAvatarUrl(figure: string): string {
  return `https://habblet.city/habbo-imaging/avatarimage?figure=${encodeURIComponent(figure)}&direction=2&head_direction=2&gesture=sml&size=l`;
}
