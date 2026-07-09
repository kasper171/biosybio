/** ALBUM_COPY — OTP timing/constants isolated from Card Normal connection system */

export const ALBUM_CONNECTION_OTP_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const ALBUM_CONNECTION_OTP_WAIT_MS = 50_000;
export const ALBUM_CONNECTION_OTP_VALIDATE_WINDOW_MS = 120_000;
export const ALBUM_HOTEL_OTP_WAIT_SECONDS = 65;

export const ALBUM_CONNECTION_ALREADY_LINKED_MESSAGE =
  "This user is already linked. If you continue, they will be unlinked from the other album profile.";

export function albumGenerateConnectionOtp(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += ALBUM_CONNECTION_OTP_CHARS[Math.floor(Math.random() * ALBUM_CONNECTION_OTP_CHARS.length)];
  }
  return code;
}

export function albumTextContainsOtp(text: string, otp: string): boolean {
  return text.toUpperCase().includes(otp.toUpperCase());
}

export function albumIsOtpTimingValid(
  unlockAt: number,
  expiresAt: number,
  now = Date.now(),
): "ok" | "waiting" | "expired" {
  if (now < unlockAt) return "waiting";
  if (now > expiresAt) return "expired";
  return "ok";
}
