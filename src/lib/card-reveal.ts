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

/** Duração estimada da entrada do card principal (ms), antes dos cards secundários. */
export function getMainCardRevealDurationMs(effect: CardRevealEffect): number {
  switch (effect) {
    case "fade":
      return 1000;
    case "slide_up":
      return 800;
    case "scale":
      return 850;
  }
}

/** Intervalo entre cada card secundário após o principal (ms). */
export const SECONDARY_REVEAL_STAGGER_MS = 80;

/**
 * Atraso de entrada de um card secundário (Discord, hotel, música, blocos…).
 * `orderAfterMain` = 0 para o primeiro após o principal, 1 para o próximo, etc.
 */
export function getSecondaryRevealDelayMs(
  effect: CardRevealEffect,
  orderAfterMain: number,
): number {
  return getMainCardRevealDurationMs(effect) + orderAfterMain * SECONDARY_REVEAL_STAGGER_MS;
}

/** @deprecated Use getSecondaryRevealDelayMs — mantido para compatibilidade. */
export function getDiscordRevealDelay(effect: CardRevealEffect): number {
  return getMainCardRevealDurationMs(effect);
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
