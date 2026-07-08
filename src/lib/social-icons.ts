import type { CSSProperties } from "react";
import type { Profile } from "@/lib/profile-storage";
import { hexToRgba } from "@/lib/profile-colors";

/** Espaço horizontal entre ícones sociais no card (~30% menor que gap-1 / 4px) */
export const SOCIAL_ICON_GAP_PX = 3;

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

export function resolveSocialIconBloomColor(
  profile: Profile,
  iconColor: string,
): string {
  const custom = profile.social_icon_bloom_color?.trim();
  if (custom) return custom;
  return iconColor;
}

/** Glow suave aplicado no ícone (SVG), não no container retangular */
export function getSocialIconBloomStyle(
  glowColor: string,
  enabled: boolean,
): CSSProperties | undefined {
  if (!enabled) return undefined;

  return {
    filter: [
      `drop-shadow(0 0 1px ${hexToRgba(glowColor, 0.55)})`,
      `drop-shadow(0 0 4px ${hexToRgba(glowColor, 0.28)})`,
    ].join(" "),
  };
}
