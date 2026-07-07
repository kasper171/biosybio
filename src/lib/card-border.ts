import type { CSSProperties } from "react";

export const CARD_BORDER_STYLES = ["solid", "dashed", "dotted", "double"] as const;
export type CardBorderStyle = (typeof CARD_BORDER_STYLES)[number];

export function normalizeCardBorderStyle(raw?: string): CardBorderStyle {
  if (raw && (CARD_BORDER_STYLES as readonly string[]).includes(raw)) {
    return raw as CardBorderStyle;
  }
  return "solid";
}

/** Classes Tailwind para border-style (espessura/cor vêm via style). */
export function cardBorderStyleClass(style: CardBorderStyle): string {
  switch (style) {
    case "dashed":
      return "border-dashed";
    case "dotted":
      return "border-dotted";
    case "double":
      return "border-double";
    default:
      return "border-solid";
  }
}

export function buildCardBorderStyle(
  width: number,
  style: CardBorderStyle,
  color: string,
  radius: number,
): Pick<CSSProperties, "borderWidth" | "borderStyle" | "borderColor" | "borderRadius" | "boxSizing"> {
  if (width <= 0) {
    return {
      borderRadius: radius,
      boxSizing: "border-box",
    };
  }
  return {
    borderWidth: width,
    borderStyle: style,
    borderColor: color,
    borderRadius: radius,
    boxSizing: "border-box",
  };
}

export function buildCardGlowShadow(enabled: boolean, color: string, size: number): string | undefined {
  if (!enabled) return undefined;
  return `0 0 ${size}px ${color}88, 0 0 ${Math.max(size * 2, 2)}px ${color}44`;
}

/** Mesma técnica do ProfileCard — borda sólida via box-shadow (px idênticos). */
export function buildCardSolidBorderShadow(width: number, color: string): string | null {
  if (width <= 0) return null;
  return `0 0 0 ${width}px ${color}`;
}

export function combineBoxShadows(...parts: Array<string | null | undefined>): string | undefined {
  const combined = parts.filter(Boolean).join(", ");
  return combined || undefined;
}
