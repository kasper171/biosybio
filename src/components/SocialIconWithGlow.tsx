import type { ComponentType, SVGProps } from "react";
import { buildLogoGlowFilter } from "@/lib/logo-glow-filter";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type SocialIconWithGlowProps = {
  icon: IconComponent;
  size: number;
  color: string;
  glow?: boolean;
  glowColor?: string;
};

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
