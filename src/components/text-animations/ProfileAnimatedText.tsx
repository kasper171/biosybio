import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { TextAnimationId } from "@/lib/text-animations";
import { SlideInText } from "./SlideInText";
import { ScaleInText } from "./ScaleInText";
import { BouncyText } from "./BouncyText";
import { BlurInText } from "./BlurInText";
import { WavyText } from "./WavyText";
import { StaggeredPopInText } from "./StaggeredPopInText";
import { ShinyText } from "./ShinyText";
import { GradientText } from "./GradientText";
import { GlitchText } from "./GlitchText";
import { MorphingText } from "./MorphingText";
import { TypewriterText } from "./TypewriterText";
import { ParticleText } from "./ParticleText";

type Props = {
  text: string;
  effect: TextAnimationId;
  className?: string;
  style?: CSSProperties;
  charStyle?: CSSProperties;
  /** Cor de destaque (glow / gradiente) */
  accentColor?: string;
  /** Cor das partículas (efeito particle) */
  particleColor?: string;
  /** Preview menor no picker do dashboard */
  compact?: boolean;
};

const VERTICAL_ROOM_EFFECTS: TextAnimationId[] = [
  "slide_in",
  "scale_in",
  "bouncy",
  "wavy",
  "staggered_pop_in",
  "particle",
];

function AnimatedTextShell({
  children,
  compact,
  effect,
  className,
}: {
  children: ReactNode;
  compact: boolean;
  effect: TextAnimationId;
  className?: string;
}) {
  const needsVerticalRoom = VERTICAL_ROOM_EFFECTS.includes(effect);

  return (
    <span
      className={cn(
        "relative inline-block max-w-full",
        compact ? "z-[1]" : "z-[4]",
        needsVerticalRoom && !compact && "py-2",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ProfileAnimatedText({
  text,
  effect,
  className,
  style,
  charStyle,
  accentColor,
  particleColor,
  compact = false,
}: Props) {
  if (!text || effect === "none") return <>{text}</>;

  const wrapperClass = cn(
    compact ? "text-sm font-bold text-white" : "inline-block",
    className,
  );
  const mergedStyle: CSSProperties = { ...style };
  const mergedChar: CSSProperties = { ...style, ...charStyle };
  const baseColor = (mergedStyle.color as string) ?? "#ffffff";
  const accent = accentColor ?? baseColor;
  const resolvedParticleColor = particleColor ?? accent;
  const gradientColors = [baseColor, accent, baseColor];
  const glitchStyle: CSSProperties = {
    font: mergedStyle.font,
    lineHeight: mergedStyle.lineHeight,
    letterSpacing: mergedStyle.letterSpacing,
  };

  let content: ReactNode;

  switch (effect) {
    case "slide_in":
      content = (
        <SlideInText text={text} className={wrapperClass} style={mergedStyle} charStyle={mergedChar} />
      );
      break;
    case "scale_in":
      content = (
        <ScaleInText text={text} className={wrapperClass} style={mergedStyle} charStyle={mergedChar} />
      );
      break;
    case "bouncy":
      content = (
        <BouncyText text={text} className={wrapperClass} style={mergedStyle} charStyle={mergedChar} />
      );
      break;
    case "blur_in":
      content = (
        <BlurInText text={text} className={wrapperClass} style={mergedStyle} charStyle={mergedChar} />
      );
      break;
    case "wavy":
      content = (
        <WavyText text={text} className={wrapperClass} style={mergedStyle} charStyle={mergedChar} />
      );
      break;
    case "staggered_pop_in":
      content = (
        <StaggeredPopInText
          text={text}
          className={wrapperClass}
          style={mergedStyle}
          charStyle={mergedChar}
        />
      );
      break;
    case "shiny":
      content = (
        <ShinyText text={text} speed={3} className={wrapperClass} style={mergedStyle} />
      );
      break;
    case "gradient":
      content = (
        <GradientText className={wrapperClass} style={mergedStyle} colors={gradientColors}>
          {text}
        </GradientText>
      );
      break;
    case "glitch":
      content = (
        <GlitchText speed={3.4} className={wrapperClass} style={glitchStyle}>
          {text}
        </GlitchText>
      );
      break;
    case "morphing":
      content = (
        <MorphingText
          text={text}
          className={wrapperClass}
          style={mergedStyle}
          duration={compact ? 1800 : 3000}
        />
      );
      break;
    case "typewriter":
      content = (
        <TypewriterText
          text={text}
          className={wrapperClass}
          style={mergedStyle}
          speed={compact ? 55 : 100}
          deleteSpeed={compact ? 35 : 50}
          pauseDuration={compact ? 900 : 2000}
        />
      );
      break;
    case "particle":
      content = (
        <ParticleText
          text={text}
          className={wrapperClass}
          style={mergedStyle}
          particleColor={resolvedParticleColor}
          particleCount={compact ? 16 : 24}
        />
      );
      break;
    default:
      content = <span className={wrapperClass} style={mergedStyle}>{text}</span>;
  }

  return (
    <AnimatedTextShell compact={compact} effect={effect}>
      {content}
    </AnimatedTextShell>
  );
}
