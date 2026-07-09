import { motion } from "motion/react";
import {
  albumNormalizeTextAnimationId,
  type AlbumTextAnimationId,
} from "@/features/album/lib/effects/album-text-animations";
import type { AlbumTheme } from "@/features/album/types/album.types";
import { albumGetTextGlowStyle } from "@/features/album/lib/effects/album-profile-colors";

type Props = {
  text: string;
  animationId?: string;
  theme: AlbumTheme;
  className?: string;
};

function renderByAnimation(id: AlbumTextAnimationId, text: string, className?: string) {
  switch (id) {
    case "slide_in":
      return (
        <motion.span
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className={className}
        >
          {text}
        </motion.span>
      );
    case "scale_in":
      return (
        <motion.span
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className={className}
        >
          {text}
        </motion.span>
      );
    case "blur_in":
      return (
        <motion.span
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          className={className}
        >
          {text}
        </motion.span>
      );
    case "gradient":
      return (
        <span
          className={`bg-clip-text text-transparent ${className ?? ""}`}
          style={{
            backgroundImage: "linear-gradient(90deg, oklch(0.75 0.28 0), oklch(0.6 0.27 10), #fff)",
          }}
        >
          {text}
        </span>
      );
    case "typewriter":
      return (
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: "auto" }}
          className={`inline-block overflow-hidden whitespace-nowrap ${className ?? ""}`}
        >
          {text}
        </motion.span>
      );
    default:
      return <span className={className}>{text}</span>;
  }
}

export function AlbumAnimatedText({ text, animationId, theme, className }: Props) {
  const id = albumNormalizeTextAnimationId(animationId);
  const glow = albumGetTextGlowStyle(theme);
  return (
    <span style={glow} className={className}>
      {renderByAnimation(id, text, undefined)}
    </span>
  );
}
