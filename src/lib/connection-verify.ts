export const CONNECTION_OTP_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
/** Tempo de espera antes de liberar o botão Validar */
export const CONNECTION_OTP_WAIT_MS = 50_000;
/** Janela para validar após a espera */
export const CONNECTION_OTP_VALIDATE_WINDOW_MS = 120_000;

export const CONNECTION_ALREADY_LINKED_MESSAGE =
  "This user is already linked. If you continue, they will be unlinked from the other profile.";

export function generateConnectionOtp(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += CONNECTION_OTP_CHARS[Math.floor(Math.random() * CONNECTION_OTP_CHARS.length)];
  }
  return code;
}

export function textContainsOtp(text: string, otp: string): boolean {
  return text.toUpperCase().includes(otp.toUpperCase());
}

export function isOtpTimingValid(unlockAt: number, expiresAt: number, now = Date.now()): "ok" | "waiting" | "expired" {
  if (now < unlockAt) return "waiting";
  if (now > expiresAt) return "expired";
  return "ok";
}
