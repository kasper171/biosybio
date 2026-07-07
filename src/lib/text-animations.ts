export type TextAnimationId =
  | "none"
  | "slide_in"
  | "scale_in"
  | "bouncy"
  | "blur_in"
  | "wavy"
  | "staggered_pop_in"
  | "shiny"
  | "gradient"
  | "glitch"
  | "morphing"
  | "typewriter"
  | "particle";

export const TEXT_ANIMATION_IDS: TextAnimationId[] = [
  "none",
  "slide_in",
  "scale_in",
  "bouncy",
  "blur_in",
  "wavy",
  "staggered_pop_in",
  "shiny",
  "gradient",
  "glitch",
  "morphing",
  "typewriter",
  "particle",
];

export const TEXT_ANIMATION_LABELS: Record<TextAnimationId, string> = {
  none: "Nenhum",
  slide_in: "Slide In",
  scale_in: "Scale In",
  bouncy: "Bouncy",
  blur_in: "Blur In",
  wavy: "Wavy",
  staggered_pop_in: "Staggered Pop In",
  shiny: "Shiny",
  gradient: "Gradient",
  glitch: "Glitch",
  morphing: "Morphing",
  typewriter: "Typewriter",
  particle: "Particle",
};

export function normalizeTextAnimationId(value: unknown): TextAnimationId {
  if (value === "textured_mask") return "none";
  if (typeof value === "string" && TEXT_ANIMATION_IDS.includes(value as TextAnimationId)) {
    return value as TextAnimationId;
  }
  return "none";
}

export function hasActiveTextAnimation(value: unknown): boolean {
  return normalizeTextAnimationId(value) !== "none";
}
