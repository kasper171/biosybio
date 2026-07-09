import type { CSSProperties } from "react";
import type { AlbumTheme } from "@/features/album/types/album.types";

/** ALBUM_COPY */
export function albumHexToRgba(hex: string, alpha: number): string {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export function albumGetTextGlowStyle(theme: AlbumTheme): CSSProperties | undefined {
  if (!theme.glowEnabled || !theme.glowColor) return undefined;
  const size = Math.min(theme.glowSize ?? 8, 24);
  const c = albumHexToRgba(theme.glowColor, 0.55);
  return { textShadow: `0 0 ${size}px ${c}, 0 0 ${size * 2}px ${albumHexToRgba(theme.glowColor, 0.25)}` };
}

export function albumPageStyle(theme: AlbumTheme): CSSProperties {
  return {
    backgroundColor: theme.backgroundColor ?? "#0a0a0f",
    color: theme.bodyTextColor ?? "rgba(255,255,255,0.85)",
    fontFamily: theme.pageFontFamily ?? undefined,
  };
}

export const ALBUM_BRAND_GRADIENT =
  "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))";
