import type { ProfileOverlayType } from "@/lib/overlays/types";

type Rgb = { r: number; g: number; b: number };

export function hexToRgb(hex: string): Rgb {
  const clean = hex.replace("#", "").trim();
  if (clean.length !== 6) return { r: 255, g: 255, b: 255 };
  const n = parseInt(clean, 16);
  if (Number.isNaN(n)) return { r: 255, g: 255, b: 255 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Cor opaca — a opacidade global do overlay controla a intensidade visível. */
function rgb(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${r},${g},${b})`;
}

export function buildDiagonalStripesBackground(hex: string, spacing: number): string {
  const gap = Math.max(6, Math.round(spacing));
  const stripe = Math.max(2, Math.round(gap * 0.4));
  const color = rgb(hex);
  return `repeating-linear-gradient(45deg, ${color} 0px, ${color} ${stripe}px, transparent ${stripe}px, transparent ${gap}px)`;
}

export function buildCyberGridBackground(hex: string): string {
  const line = rgb(hex);
  return `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`;
}

export function buildCyberGridBackgroundSize(spacing: number): string {
  const size = Math.max(4, Math.round(spacing));
  return `${size}px ${size}px`;
}

export function buildDotPatternBackground(hex: string): string {
  const dot = rgb(hex);
  return `radial-gradient(circle, ${dot} 1.5px, transparent 2px)`;
}

export function buildDotPatternBackgroundSize(spacing: number): string {
  const size = Math.max(4, Math.round(spacing));
  return `${size}px ${size}px`;
}

export function applyStaticTextureStyles(
  el: HTMLElement,
  type: ProfileOverlayType,
  color: string,
  spacing: number,
): void {
  el.style.backgroundRepeat = "repeat";
  el.style.backgroundPosition = "0 0";

  switch (type) {
    case "diagonal-stripes":
      el.style.backgroundImage = buildDiagonalStripesBackground(color, spacing);
      el.style.backgroundSize = "auto";
      break;
    case "cyber-grid":
      el.style.backgroundImage = buildCyberGridBackground(color);
      el.style.backgroundSize = buildCyberGridBackgroundSize(spacing);
      break;
    case "dot-pattern":
      el.style.backgroundImage = buildDotPatternBackground(color);
      el.style.backgroundSize = buildDotPatternBackgroundSize(spacing);
      break;
    default:
      break;
  }
}
