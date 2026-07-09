import type { Profile } from "@/lib/profile-storage";
import { PROFILE_OVERLAY_TYPES, isStaticOverlayType, type ProfileOverlayType } from "@/lib/overlays/types";
export type { ProfileOverlayType } from "@/lib/overlays/types";
export { isStaticOverlayType, PROFILE_OVERLAY_TYPES };

export const OVERLAY_OPACITY_MIN = 0.03;
export const OVERLAY_OPACITY_MAX = 0.15;
export const OVERLAY_OPACITY_DEFAULT = 50;

export const OVERLAY_COLOR_DEFAULT = "#ffffff";
export const OVERLAY_SPACING_MIN = 4;
export const OVERLAY_SPACING_MAX = 48;
export const OVERLAY_SPACING_DEFAULT = 10;

export function normalizeOverlayOpacity(raw: unknown): number {
  const n = Number(raw ?? OVERLAY_OPACITY_DEFAULT);
  if (!Number.isFinite(n)) return OVERLAY_OPACITY_DEFAULT;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function normalizeOverlayColor(raw: unknown): string {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return OVERLAY_COLOR_DEFAULT;
}

export function normalizeOverlaySpacing(raw: unknown): number {
  const n = Number(raw ?? OVERLAY_SPACING_DEFAULT);
  if (!Number.isFinite(n)) return OVERLAY_SPACING_DEFAULT;
  return Math.min(OVERLAY_SPACING_MAX, Math.max(OVERLAY_SPACING_MIN, Math.round(n)));
}

/** Converte slider 0–100 em opacity CSS do overlay (3%–15%). */
export function overlayCssOpacity(percent: number): number {
  const pct = normalizeOverlayOpacity(percent);
  const range = OVERLAY_OPACITY_MAX - OVERLAY_OPACITY_MIN;
  return OVERLAY_OPACITY_MIN + (pct / 100) * range;
}

export function normalizeOverlayType(raw: unknown): ProfileOverlayType | null {
  if (typeof raw === "string" && PROFILE_OVERLAY_TYPES.includes(raw as ProfileOverlayType)) {
    return raw as ProfileOverlayType;
  }
  return null;
}

export function normalizeProfileOverlayType(
  legacy: { overlay_noise_enabled?: boolean },
  rawType?: unknown,
): ProfileOverlayType | null {
  const direct = normalizeOverlayType(rawType);
  if (direct) return direct;
  if (legacy.overlay_noise_enabled === true) return "noise-denso";
  return null;
}

export function resolveActiveProfileOverlay(
  profile: Pick<Profile, "overlay_type"> & { overlay_noise_enabled?: boolean },
): ProfileOverlayType | null {
  return normalizeProfileOverlayType(
    { overlay_noise_enabled: profile.overlay_noise_enabled },
    profile.overlay_type,
  );
}

export function getOverlayRuntimeOptions(
  profile: Pick<Profile, "overlay_color" | "overlay_spacing">,
) {
  return {
    color: normalizeOverlayColor(profile.overlay_color),
    spacing: normalizeOverlaySpacing(profile.overlay_spacing),
  };
}

/** @deprecated use normalizeOverlayOpacity */
export const normalizeOverlayNoiseOpacity = normalizeOverlayOpacity;

/** @deprecated use overlayCssOpacity */
export const overlayNoiseCssOpacity = overlayCssOpacity;

/** @deprecated */
export const OVERLAY_NOISE_OPACITY_DEFAULT = OVERLAY_OPACITY_DEFAULT;
