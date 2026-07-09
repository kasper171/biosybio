export type AlbumHotelPlatform = "habbo" | "habblet";

export type AlbumHotelProfileData = {
  platform: AlbumHotelPlatform;
  username: string;
  figure: string;
  motto: string | null;
  level?: number | null;
  achievementPoints?: number | null;
  hotelDomain?: string | null;
};

export type AlbumHotelFetchResult =
  | { ok: true; data: AlbumHotelProfileData }
  | { ok: false; error: "invalid_username" | "invalid_hotel" | "user_not_found" | "service_unavailable" };
