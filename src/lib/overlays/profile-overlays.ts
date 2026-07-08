import type { Profile } from "@/lib/profile-storage";

export const OVERLAY_NOISE_OPACITY_MIN = 0.03;
export const OVERLAY_NOISE_OPACITY_MAX = 0.15;
export const OVERLAY_NOISE_OPACITY_DEFAULT = 50;

export function normalizeOverlayNoiseOpacity(raw: unknown): number {
  const n = Number(raw ?? OVERLAY_NOISE_OPACITY_DEFAULT);
  if (!Number.isFinite(n)) return OVERLAY_NOISE_OPACITY_DEFAULT;
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** Converte slider 0–100 em opacity CSS do canvas (3%–15%). */
export function overlayNoiseCssOpacity(percent: number): number {
  const pct = normalizeOverlayNoiseOpacity(percent);
  const range = OVERLAY_NOISE_OPACITY_MAX - OVERLAY_NOISE_OPACITY_MIN;
  return OVERLAY_NOISE_OPACITY_MIN + (pct / 100) * range;
}

export function resolveActiveProfileOverlay(
  profile: Pick<Profile, "overlay_noise_enabled">,
): "noise" | null {
  if (profile.overlay_noise_enabled === true) return "noise";
  return null;
}
