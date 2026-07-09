import type { CSSProperties, ReactNode } from "react";
import type { AlbumTheme } from "@/features/album/types/album.types";
import { albumNormalizeTextAnimationId } from "@/features/album/lib/effects/album-text-animations";
import { ProfileAnimatedText } from "@/components/text-animations/ProfileAnimatedText";
import { albumGetTextGlowStyle } from "@/features/album/lib/effects/album-profile-colors";
import type { TextAnimationId } from "@/lib/text-animations";

type Props = {
  text: string;
  animationId?: string;
  theme: AlbumTheme;
  className?: string;
  style?: CSSProperties;
};

export function AlbumAnimatedText({ text, animationId, theme, className, style }: Props) {
  const effect = albumNormalizeTextAnimationId(animationId) as TextAnimationId;
  const glow = albumGetTextGlowStyle(theme);
  const accent = theme.glowColor ?? theme.titleTextColor ?? "#ffffff";

  return (
    <ProfileAnimatedText
      text={text}
      effect={effect}
      className={className}
      style={{ ...glow, ...style }}
      accentColor={accent}
      particleColor={accent}
    />
  );
}
