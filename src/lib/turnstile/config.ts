export type TurnstileAction = "signup" | "profile_view";

export function getTurnstileSiteKey(): string | undefined {
  const key = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  return typeof key === "string" && key.trim().length > 0 ? key.trim() : undefined;
}

export function isTurnstileEnabled(): boolean {
  return Boolean(getTurnstileSiteKey());
}
