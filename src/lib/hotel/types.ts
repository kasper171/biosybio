export type HotelPlatform = "habbo" | "habblet";

export type HotelFetchErrorCode =
  | "user_not_found"
  | "service_unavailable"
  | "invalid_username"
  | "invalid_hotel";

export type HotelProfileData = {
  platform: HotelPlatform;
  username: string;
  avatar: string;
  motto: string;
  level: number | null;
  achievementPoints: number | null;
  figure: string;
  hotelDomain: string | null;
};

export type HotelFetchResult =
  | { ok: true; data: HotelProfileData }
  | { ok: false; error: HotelFetchErrorCode; message: string };

export const HOTEL_FETCH_MESSAGES: Record<HotelFetchErrorCode, string> = {
  user_not_found: "Player not found. Check the name and selected hotel.",
  service_unavailable: "Service temporarily unavailable. Try again in a moment.",
  invalid_username: "Enter a valid player name.",
  invalid_hotel: "Invalid hotel. Select a hotel from the list.",
};
