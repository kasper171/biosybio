import { readHotelCache, writeHotelCache } from "@/lib/hotel/cache";
import { fetchHotelProfileFn } from "@/lib/hotel/hotel.functions";
import type { HotelPlatform, HotelFetchResult } from "@/lib/hotel/types";
import { HOTEL_FETCH_MESSAGES } from "@/lib/hotel/types";

export async function fetchHotelProfile(
  platform: HotelPlatform,
  username: string,
  hotelDomain?: string | null,
): Promise<HotelFetchResult> {
  const trimmed = username.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: "invalid_username",
      message: HOTEL_FETCH_MESSAGES.invalid_username,
    };
  }

  const cached = readHotelCache(platform, trimmed, hotelDomain);
  if (cached) return { ok: true, data: cached };

  const result = await fetchHotelProfileFn({
    data: {
      platform,
      username: trimmed,
      hotelDomain: hotelDomain ?? undefined,
    },
  });

  if (result.ok) {
    writeHotelCache(result.data);
  }

  return result;
}

export { HOTEL_FETCH_MESSAGES };
