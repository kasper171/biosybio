import type { CSSProperties } from "react";
import type { Profile } from "@/lib/profile-storage";
import { hexToRgba } from "@/lib/profile-colors";

export function getSocialIconScale(profile: Profile): number {
  const raw = Number(profile.social_icon_size ?? 100);
  if (!Number.isFinite(raw)) return 1;
  return Math.min(140, Math.max(60, raw)) / 100;
}

export function getSocialIconDimensions(profile: Profile, compact: boolean) {
  const scale = getSocialIconScale(profile);
  const logo = profile.social_icon_style === "logo";
  const baseBox = logo ? (compact ? 32 : 36) : compact ? 36 : 44;
  const baseIcon = logo ? (compact ? 20 : 24) : compact ? 16 : 20;

  return {
    boxPx: Math.round(baseBox * scale),
    iconPx: Math.round(baseIcon * scale),
    scale,
  };
}

export function getSocialIconBloomStyle(
  color: string,
  enabled: boolean,
): CSSProperties | undefined {
  if (!enabled) return undefined;

  return {
    filter: [
      `drop-shadow(0 0 3px ${color})`,
      `drop-shadow(0 0 8px ${hexToRgba(color, 0.85)})`,
      `drop-shadow(0 0 16px ${hexToRgba(color, 0.45)})`,
    ].join(" "),
  };
}
