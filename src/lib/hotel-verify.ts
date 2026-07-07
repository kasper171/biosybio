import {
  CONNECTION_OTP_VALIDATE_WINDOW_MS,
  CONNECTION_OTP_WAIT_MS,
  generateConnectionOtp,
} from "@/lib/connection-verify";

export const HOTEL_OTP_WAIT_MS = CONNECTION_OTP_WAIT_MS;
export const HOTEL_OTP_VALIDATE_WINDOW_MS = CONNECTION_OTP_VALIDATE_WINDOW_MS;

export type HotelVerifyError =
  | "invalid_username"
  | "invalid_hotel"
  | "user_not_found"
  | "code_not_found"
  | "expired"
  | "waiting"
  | "network";

export const HOTEL_VERIFY_MESSAGES: Record<HotelVerifyError, string> = {
  invalid_username: "Nome do jogador inválido.",
  invalid_hotel: "Hotel inválido.",
  user_not_found: "Jogador não encontrado.",
  code_not_found: "O código não foi encontrado na missão do seu personagem.",
  expired: "O código expirou. Gere um novo código e tente novamente.",
  waiting: "Aguarde 50 segundos antes de validar.",
  network: "Falha ao validar. Tente novamente em instantes.",
};

export const generateHotelOtp = generateConnectionOtp;
