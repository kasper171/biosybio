/** Lê a secret do Turnstile em tempo de request (não no import do módulo). */
export function getTurnstileSecretKey(): string | undefined {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  return secret || undefined;
}
