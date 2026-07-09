export const BACKGROUND_REVEAL_DELAY_MAX_SEC = 120;
export const BACKGROUND_REVEAL_DELAY_SLIDER_STEP_SEC = 0.1;
export const BACKGROUND_REVEAL_DELAY_INPUT_STEP_SEC = 0.01;

export function normalizeBackgroundRevealDelaySec(raw: unknown): number {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(BACKGROUND_REVEAL_DELAY_MAX_SEC, Math.round(n * 100) / 100);
}

export function formatBackgroundRevealDelaySec(sec: number): string {
  const n = normalizeBackgroundRevealDelaySec(sec);
  if (n <= 0) return "0";
  return String(Number(n.toFixed(2)));
}
