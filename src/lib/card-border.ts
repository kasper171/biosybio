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

export type CardBorderChrome = {
  style: Pick<
    CSSProperties,
    "borderRadius" | "boxSizing" | "boxShadow" | "borderWidth" | "borderStyle" | "borderColor"
  >;
  className: string;
};

/** Borda dupla no CSS exige espessura mínima de 3px */
export function effectiveCardBorderWidth(width: number, style: CardBorderStyle): number {
  const w = Number(width) || 0;
  if (w <= 0) return 0;
  if (style === "double" && w < 3) return 3;
  return w;
}

/**
 * Borda do card: sólida via box-shadow (mais nítida); tracejada/pontilhada/dupla via border CSS.
 */
export function buildCardBorderChrome(options: {
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  borderStyle?: string;
  glowEnabled?: boolean;
  glowColor?: string;
  glowSize?: number;
}): CardBorderChrome {
  const borderStyle = normalizeCardBorderStyle(options.borderStyle);
  const bw = effectiveCardBorderWidth(options.borderWidth, borderStyle);
  const bc = options.borderColor ?? "#ffffff";
  const radius = options.borderRadius ?? 16;
  const useSolidShadow = bw > 0 && borderStyle === "solid";
  const useCssBorder = bw > 0 && borderStyle !== "solid";

  const style: CardBorderChrome["style"] = {
    borderRadius: radius,
    boxSizing: "border-box",
    boxShadow: combineBoxShadows(
      useSolidShadow ? buildCardSolidBorderShadow(bw, bc) : null,
      buildCardGlowShadow(
        Boolean(options.glowEnabled),
        options.glowColor ?? bc,
        options.glowSize ?? 24,
      ),
    ),
  };

  if (useCssBorder) {
    style.borderWidth = bw;
    style.borderStyle = borderStyle;
    style.borderColor = bc;
  }

  return {
    style,
    className: useCssBorder ? cardBorderStyleClass(borderStyle) : "",
  };
}

export function buildCardSurfaceChrome(options: {
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  borderStyle?: string;
  glowEnabled?: boolean;
  glowColor?: string;
  glowSize?: number;
  background?: string;
  backdropBlur?: number;
}): { style: CSSProperties; className: string } {
  const { style, className } = buildCardBorderChrome(options);
  const fullStyle: CSSProperties = { ...style };

  if (options.background) {
    fullStyle.background = options.background;
  }
  if (options.backdropBlur != null) {
    fullStyle.backdropFilter = `blur(${options.backdropBlur}px)`;
    fullStyle.WebkitBackdropFilter = `blur(${options.backdropBlur}px)`;
  }

  return { style: fullStyle, className };
}
