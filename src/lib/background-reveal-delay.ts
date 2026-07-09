export const BACKGROUND_REVEAL_DELAY_MAX_SEC = 120;

export function normalizeBackgroundRevealDelaySec(raw: unknown): number {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(BACKGROUND_REVEAL_DELAY_MAX_SEC, Math.round(n * 10) / 10);
}
