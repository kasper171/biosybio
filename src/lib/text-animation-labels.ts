import type { TextAnimationId } from "@/lib/text-animations";
import { translate } from "@/i18n/LocaleProvider";

export function getTextAnimationLabel(id: TextAnimationId): string {
  const map: Record<TextAnimationId, string> = {
    none: translate("lib.animNone"),
    slide_in: translate("lib.animSlideIn"),
    scale_in: translate("lib.animScaleIn"),
    bouncy: translate("lib.animBouncy"),
    blur_in: translate("lib.animBlurIn"),
    wavy: translate("lib.animWavy"),
    staggered_pop_in: translate("lib.animStaggered"),
    shiny: translate("lib.animShiny"),
    gradient: translate("lib.animGradient"),
    glitch: translate("lib.animGlitch"),
    morphing: translate("lib.animMorphing"),
    typewriter: translate("lib.animTypewriter"),
    particle: translate("lib.animParticle"),
  };
  return map[id];
}
