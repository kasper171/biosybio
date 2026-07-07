import type { ReactNode } from "react";
import { type CardRevealEffect } from "@/lib/card-reveal";

type Props = {
  effect: CardRevealEffect;
  delayMs?: number;
  children: ReactNode;
};

function classForEffect(effect: CardRevealEffect): string {
  switch (effect) {
    case "slide_up":
      return "biosy-entry-group-slide";
    case "scale":
      return "biosy-entry-group-scale";
    default:
      return "biosy-entry-group-fade";
  }
}

export function EntryGroup({ effect, delayMs = 0, children }: Props) {
  return (
    <div
      className={classForEffect(effect)}
      style={delayMs > 0 ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}

