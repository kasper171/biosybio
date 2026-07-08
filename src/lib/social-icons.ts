import type { CSSProperties } from "react";
import type { Profile } from "@/lib/profile-storage";

export const SOCIAL_ICON_SIZE_MIN = 60;
export const SOCIAL_ICON_SIZE_MAX = 200;
export const SOCIAL_ICON_GAP_MIN = 0;
export const SOCIAL_ICON_GAP_MAX = 20;
export const SOCIAL_ICON_GAP_DEFAULT = 5;

/** Tamanho visivel da logo a 100% (px) */
export const SOCIAL_ICON_BASE_PX = 28;
export const SOCIAL_ICON_BASE_PX_COMPACT = 24;
/** Padding interno do modo boxed a 100% (px, cada lado) */
export const SOCIAL_BOXED_PAD_PX = 4;

export function getSocialIconScale(profile: Profile): number {
  const raw = Number(profile.social_icon_size ?? 100);
  if (!Number.isFinite(raw)) return 1;
  return Math.min(SOCIAL_ICON_SIZE_MAX, Math.max(SOCIAL_ICON_SIZE_MIN, raw)) / 100;
}

export function getSocialIconGapPx(profile: Profile): number {
  const raw = Number(profile.social_icon_gap ?? SOCIAL_ICON_GAP_DEFAULT);
  if (!Number.isFinite(raw)) return SOCIAL_ICON_GAP_DEFAULT;
  return Math.min(SOCIAL_ICON_GAP_MAX, Math.max(SOCIAL_ICON_GAP_MIN, Math.round(raw)));
}

export function getSocialIconsRowStyle(profile: Profile): CSSProperties {
  return { gap: `${getSocialIconGapPx(profile)}px` };
}

/** Espaço entre a descrição/bio e a fileira de ícones sociais (Tailwind mt-3.5 ≈ 14px) */
export const SOCIAL_ICONS_AFTER_BIO_GAP_CLASS = "mt-3.5";

export function getSocialIconsRowClassName(
  layout: Profile["card_layout"] | undefined,
): string {
  const base = "biosy-social-icons-row flex min-w-0 max-w-full flex-wrap items-center overflow-visible";
  if (layout === "aligned") return `${base} justify-center`;
  return `${base} shrink-0 justify-center`;
}

export function getSocialIconDimensions(profile: Profile, compact: boolean) {
  const scale = getSocialIconScale(profile);
  const logo = profile.social_icon_style === "logo";
  const base = compact ? SOCIAL_ICON_BASE_PX_COMPACT : SOCIAL_ICON_BASE_PX;
  const iconPx = Math.max(12, Math.round(base * scale));
  const padPx = logo ? 0 : Math.max(2, Math.round(SOCIAL_BOXED_PAD_PX * scale));
  const boxPx = logo ? iconPx : iconPx + padPx * 2;

  return {
    iconPx,
    boxPx,
    padPx,
    logo,
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

export function formatSocialIconSizeLabel(profile: Profile, compact = false): string {
  const { iconPx } = getSocialIconDimensions(profile, compact);
  const pct = Math.round(getSocialIconScale(profile) * 100);
  return `${iconPx}px (${pct}%)`;
}
