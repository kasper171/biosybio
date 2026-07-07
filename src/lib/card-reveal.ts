export type CardRevealEffect = "fade" | "slide_up" | "scale";

export const CARD_REVEAL_OPTIONS: { key: CardRevealEffect; label: string; hint: string }[] = [
  { key: "fade", label: "Lento", hint: "Aparece aos poucos" },
  { key: "slide_up", label: "Subir", hint: "Sobe suavemente" },
  { key: "scale", label: "Zoom", hint: "Cresce do centro" },
];

export function normalizeCardRevealEffect(raw: string | undefined): CardRevealEffect {
  if (raw === "slide_up" || raw === "scale") return raw;
  return "fade";
}

/** Atraso do card Discord separado (ms) — só quando discord_card_mode === outside */
export function getDiscordRevealDelay(effect: CardRevealEffect): number {
  switch (effect) {
    case "fade":
      return 900;
    case "slide_up":
      return 650;
    case "scale":
      return 500;
  }
}

export function getRevealClass(effect: CardRevealEffect): string {
  switch (effect) {
    case "slide_up":
      return "biosy-card-reveal-slide";
    case "scale":
      return "biosy-card-reveal-scale";
    default:
      return "biosy-card-reveal-fade";
  }
}
