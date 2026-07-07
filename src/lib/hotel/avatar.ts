import type { HotelPlatform } from "@/lib/hotel/types";
import { normalizeHabboHotelDomain } from "@/lib/hotel/hotels";

/** Parâmetros fixos — enquadramento idêntico Habbo / Habblet */
export const HOTEL_AVATAR_QUERY =
  "action=std&direction=2&head_direction=2&gesture=std&headonly=0&size=l";

export function buildHabboAvatarUrl(figure: string, hotelDomain: string): string {
  const domain = normalizeHabboHotelDomain(hotelDomain);
  const base = `https://www.habbo.${domain}/habbo-imaging/avatarimage`;
  return `${base}?figure=${encodeURIComponent(figure)}&${HOTEL_AVATAR_QUERY}`;
}

export function buildHabbletAvatarUrl(figure: string): string {
  return `https://imaging.habblet.city/avatarimage?figure=${encodeURIComponent(figure)}&${HOTEL_AVATAR_QUERY}`;
}

export function buildHotelAvatarUrl(
  platform: HotelPlatform,
  figure: string,
  hotelDomain?: string | null,
): string {
  if (platform === "habblet") return buildHabbletAvatarUrl(figure);
  return buildHabboAvatarUrl(figure, hotelDomain ?? "com");
}
