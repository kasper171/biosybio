import type { CSSProperties } from "react";
import type { Profile } from "@/lib/profile-storage";

export function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (!m) {
    if (hex.startsWith("rgba(") || hex.startsWith("rgb(")) return hex;
    return hex;
  }
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function glowAlphaColor(color: string, alpha: number): string {
  const m = color.replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (m) return hexToRgba(`#${m[1]}`, alpha);
  const rgba = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgba) return `rgba(${rgba[1]}, ${rgba[2]}, ${rgba[3]}, ${alpha})`;
  return color;
}

export const TEXT_GLOW_MAX_PX = 8;

export type TextGlowScope = "display_name" | "titles" | "all";

export type TextGlowTarget =
  | "display_name"
  | "body"
  | "muted"
  | "discord_title"
  | "discord_muted"
  | "discord_body";

export const TEXT_GLOW_SCOPE_LABELS: Record<TextGlowScope, string> = {
  display_name: "Display name only",
  titles: "Titles only",
  all: "All page text",
};

export function normalizeTextGlowScope(value: unknown): TextGlowScope {
  if (value === "display_name" || value === "titles" || value === "all") return value;
  return "all";
}

export function shouldApplyTextGlow(profile: Profile, target: TextGlowTarget): boolean {
  if (!profile.text_glow_enabled) return false;
  const scope = normalizeTextGlowScope(profile.text_glow_scope);
  switch (scope) {
    case "display_name":
      return target === "display_name";
    case "titles":
      return target === "display_name" || target === "discord_title";
    case "all":
      return true;
    default:
      return false;
  }
}

export function dividerBorderColor(profile: Profile): string {
  return hexToRgba(profile.inner_divider_color ?? "#ffffff", profile.inner_divider_opacity ?? 0.15);
}

/** Tamanho efetivo do glow — se ativado mas 0, usa o máximo (8px) */
export function effectiveTextGlowSize(profile: Profile): number {
  if (!profile.text_glow_enabled) return 0;
  const size = Number(profile.text_glow_size ?? 0);
  const resolved = size > 0 ? size : TEXT_GLOW_MAX_PX;
  return Math.min(TEXT_GLOW_MAX_PX, Math.max(0, resolved));
}

/**
 * Glow suave colado nas letras — sem camadas gigantes que viram “retângulo”.
 * Aplicar SOMENTE em spans inline com o texto visível (nunca no container grid).
 */
export function buildTextGlowShadow(color: string, size: number): string | undefined {
  if (size <= 0) return undefined;
  const s = Math.min(TEXT_GLOW_MAX_PX, Math.max(2, size));
  const c1 = glowAlphaColor(color, 0.95);
  const c2 = glowAlphaColor(color, 0.55);
  const c3 = glowAlphaColor(color, 0.28);
  return [
    `0 0 ${Math.max(1, Math.round(s * 0.25))}px ${c1}`,
    `0 0 ${Math.max(2, Math.round(s * 0.55))}px ${c2}`,
    `0 0 ${Math.max(3, Math.round(s * 0.9))}px ${c3}`,
  ].join(", ");
}

export function getTextGlowStyle(
  profile: Profile,
  scale = 1,
  target: TextGlowTarget = "body",
): CSSProperties {
  if (!shouldApplyTextGlow(profile, target)) return {};
  const glowSize = effectiveTextGlowSize(profile);
  if (glowSize <= 0) return {};
  const glowColor = profile.text_glow_color ?? profile.effect_glow_color ?? "#ff2d7a";
  const shadow = buildTextGlowShadow(glowColor, glowSize * scale);
  return shadow ? { textShadow: shadow } : {};
}

export function getTitleBaseStyle(profile: Profile): CSSProperties {
  return {
    color: profile.title_text_color ?? "#ffffff",
    fontFamily: profile.name_font_family === "inherit" ? undefined : profile.name_font_family,
  };
}

/** Título no card Discord — cor do perfil, fonte da página (nunca a do nome exibido). */
export function getDiscordTitleStyle(profile: Profile): CSSProperties {
  return {
    color: profile.title_text_color ?? "#ffffff",
    fontFamily: profile.page_font_family || undefined,
  };
}

export function getDiscordMutedStyle(profile: Profile): CSSProperties {
  return {
    color: profile.muted_text_color ?? "rgba(255,255,255,0.55)",
    fontFamily: profile.page_font_family || undefined,
  };
}

export function getDiscordBodyStyle(profile: Profile): CSSProperties {
  return {
    color: profile.body_text_color ?? "rgba(255,255,255,0.80)",
    fontFamily: profile.page_font_family || undefined,
  };
}

export function getBodyBaseStyle(profile: Profile): CSSProperties {
  return { color: profile.body_text_color ?? "rgba(255,255,255,0.80)" };
}

/** @deprecated use getTitleBaseStyle + getTextGlowStyle no texto inline */
export function getTitleTextStyle(profile: Profile): CSSProperties {
  return { ...getTitleBaseStyle(profile), ...getTextGlowStyle(profile, 1, "display_name") };
}

/** @deprecated use getBodyBaseStyle + getTextGlowStyle no texto inline */
export function getBodyTextStyle(profile: Profile): CSSProperties {
  return { ...getBodyBaseStyle(profile), ...getTextGlowStyle(profile, 0.75, "body") };
}

export function getMutedTextStyle(profile: Profile): CSSProperties {
  return { color: profile.muted_text_color ?? "rgba(255,255,255,0.55)" };
}

export function getIconColorStyle(profile: Profile): CSSProperties {
  return { color: profile.icon_color ?? "rgba(255,255,255,0.85)" };
}

export function getBadgeStyle(profile: Profile): CSSProperties {
  return {
    background: profile.badge_bg_color ?? "rgba(0,0,0,0.45)",
    color: profile.badge_text_color ?? "rgba(255,255,255,0.85)",
  };
}

export function getDividerStyle(profile: Profile): CSSProperties {
  return { borderColor: dividerBorderColor(profile) };
}
