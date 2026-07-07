import {
  CONNECTION_OTP_VALIDATE_WINDOW_MS,
  generateConnectionOtp,
} from "@/lib/connection-verify";

/** Time for Habbo/Habblet to propagate the motto on the public API */
export const HOTEL_OTP_WAIT_MS = 65_000;
export const HOTEL_OTP_WAIT_SECONDS = 65;
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
  invalid_username: "Invalid player name.",
  invalid_hotel: "Invalid hotel.",
  user_not_found: "Player not found.",
  code_not_found: "The code was not found in your character's motto.",
  expired: "The code expired. Generate a new one and try again.",
  waiting: `Wait ${HOTEL_OTP_WAIT_SECONDS} seconds before validating.`,
  network: "Validation failed. Try again in a moment.",
};

export const generateHotelOtp = generateConnectionOtp;
