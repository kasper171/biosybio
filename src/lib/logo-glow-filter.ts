/** drop-shadow segue o alpha do path — sem retangulo do viewBox/bbox do SVG. */
export function buildLogoGlowFilter(color: string, size: number): string {
  const tight = Math.max(1, size * 0.07);
  const soft = Math.max(2.5, size * 0.13);
  return [
    `drop-shadow(0 0 ${tight}px ${color})`,
    `drop-shadow(0 0 ${soft}px ${color})`,
  ].join(" ");
}
