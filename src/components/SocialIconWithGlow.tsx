import type { ComponentType, SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type SocialIconWithGlowProps = {
  icon: IconComponent;
  size: number;
  color: string;
  glow?: boolean;
  glowColor?: string;
};

/** drop-shadow segue o alpha do path — sem retangulo do viewBox/bbox do SVG. */
function buildLogoGlowFilter(color: string, size: number): string {
  const tight = Math.max(1, size * 0.07);
  const soft = Math.max(2.5, size * 0.13);
  return [
    `drop-shadow(0 0 ${tight}px ${color})`,
    `drop-shadow(0 0 ${soft}px ${color})`,
  ].join(" ");
}

/**
 * Bloom colado na silhueta da logo (paths do icone), nao um blur retangular atras.
 */
export function SocialIconWithGlow({
  icon: Icon,
  size,
  color,
  glow = false,
  glowColor,
}: SocialIconWithGlowProps) {
  const fill = glowColor ?? color;

  return (
    <Icon
      width={size}
      height={size}
      color={color}
      style={{
        display: "block",
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        flexShrink: 0,
        overflow: "visible",
        filter: glow ? buildLogoGlowFilter(fill, size) : undefined,
      }}
    />
  );
}
