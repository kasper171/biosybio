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
  user_not_found: "Jogador não encontrado. Verifique o nome e o hotel selecionado.",
  service_unavailable: "Serviço temporariamente indisponível. Tente novamente em instantes.",
  invalid_username: "Informe um nome de jogador válido.",
  invalid_hotel: "Hotel inválido. Selecione um hotel da lista.",
};
