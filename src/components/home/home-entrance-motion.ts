import type { Variants } from "motion/react";

export const ENTRANCE_EASE = [0.22, 1, 0.36, 1] as const;

export type EntranceVariant = "up" | "down" | "left" | "right" | "fade" | "scale";

export const ENTRANCE_VARIANTS: Record<EntranceVariant, Variants> = {
  up: {
    hidden: { opacity: 0, y: 36, filter: "blur(12px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
  down: {
    hidden: { opacity: 0, y: -28, filter: "blur(12px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
  left: {
    hidden: { opacity: 0, x: -40, y: 10, filter: "blur(12px)" },
    visible: { opacity: 1, x: 0, y: 0, filter: "blur(0px)" },
  },
  right: {
    hidden: { opacity: 0, x: 40, y: 10, filter: "blur(12px)" },
    visible: { opacity: 1, x: 0, y: 0, filter: "blur(0px)" },
  },
  fade: {
    hidden: { opacity: 0, filter: "blur(10px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  },
  scale: {
    hidden: { opacity: 0, y: 20, scale: 0.94, filter: "blur(10px)" },
    visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  },
};
