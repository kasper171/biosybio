import type { HotelProfileData } from "@/lib/hotel/types";

const TTL_MS = 1000 * 60 * 10;

type CacheEntry = { ts: number; data: HotelProfileData };

function cacheKey(platform: string, username: string, hotelDomain?: string | null): string {
  return `biosy_hotel_${platform}_${hotelDomain ?? "default"}_${username.toLowerCase()}`;
}

export function readHotelCache(
  platform: string,
  username: string,
  hotelDomain?: string | null,
): HotelProfileData | null {
  try {
    const raw = localStorage.getItem(cacheKey(platform, username, hotelDomain));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed?.ts || !parsed?.data) return null;
    if (Date.now() - parsed.ts > TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function writeHotelCache(data: HotelProfileData): void {
  try {
    const entry: CacheEntry = { ts: Date.now(), data };
    localStorage.setItem(
      cacheKey(data.platform, data.username, data.hotelDomain),
      JSON.stringify(entry),
    );
  } catch {
    // quota
  }
}

export function clearHotelCache(
  platform: string,
  username: string,
  hotelDomain?: string | null,
): void {
  try {
    localStorage.removeItem(cacheKey(platform, username, hotelDomain));
  } catch {
    // ignore
  }
}
