/** ALBUM_COPY */
export type AlbumTextAnimationId =
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

export const ALBUM_TEXT_ANIMATION_IDS: AlbumTextAnimationId[] = [
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

export const ALBUM_TEXT_ANIMATION_LABELS: Record<AlbumTextAnimationId, string> = {
  none: "Nenhum",
  slide_in: "Slide In",
  scale_in: "Scale In",
  bouncy: "Bouncy",
  blur_in: "Blur In",
  wavy: "Wavy",
  staggered_pop_in: "Pop In",
  shiny: "Shiny",
  gradient: "Gradiente",
  glitch: "Glitch",
  morphing: "Morphing",
  typewriter: "Typewriter",
  particle: "Partículas",
};

export function albumNormalizeTextAnimationId(value: unknown): AlbumTextAnimationId {
  if (typeof value === "string" && ALBUM_TEXT_ANIMATION_IDS.includes(value as AlbumTextAnimationId)) {
    return value as AlbumTextAnimationId;
  }
  return "none";
}
