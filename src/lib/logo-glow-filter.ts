import { hexToRgba } from "@/lib/profile-colors";

/** drop-shadow segue o alpha do path — sem retangulo do viewBox/bbox do SVG. */
export function buildLogoGlowFilter(color: string, size: number): string {
  const tight = Math.max(1, size * 0.07);
  const soft = Math.max(2.5, size * 0.13);
  return [
    `drop-shadow(0 0 ${tight}px ${color})`,
    `drop-shadow(0 0 ${soft}px ${color})`,
  ].join(" ");
}

/** Brilho suave para badges de cargo — detalhe sutil, não dominante. */
export function buildSubtleGlowFilter(color: string, size: number): string {
  const tight = Math.max(0.5, size * 0.025);
  const soft = Math.max(0.8, size * 0.045);
  return [
    `drop-shadow(0 0 ${tight}px ${hexToRgba(color, 0.2)})`,
    `drop-shadow(0 0 ${soft}px ${hexToRgba(color, 0.1)})`,
  ].join(" ");
}
