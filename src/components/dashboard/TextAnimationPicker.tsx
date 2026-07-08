import { useEffect, useState } from "react";
import type { TextAnimationId } from "@/lib/text-animations";
import { TEXT_ANIMATION_IDS, TEXT_ANIMATION_LABELS, normalizeTextAnimationId } from "@/lib/text-animations";
import { ProfileAnimatedText } from "@/components/text-animations/ProfileAnimatedText";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

import { SITE_NAME } from "@/lib/site";

const PREVIEW_TEXT = SITE_NAME;
const MORPHING_PREVIEW_TEXT = `Byo|Sy|${SITE_NAME}`;

/** Efeitos que rodam uma vez no mount — remontamos para repetir no picker */
const LOOP_ONCE_EFFECTS = new Set<TextAnimationId>([
  "slide_in",
  "scale_in",
  "blur_in",
  "staggered_pop_in",
]);

const LOOP_INTERVAL_MS: Partial<Record<TextAnimationId, number>> = {
  slide_in: 2800,
  scale_in: 3200,
  blur_in: 3000,
  staggered_pop_in: 3200,
};

type PreviewBoxProps = {
  effect: TextAnimationId;
  previewColor: string;
  previewAccent: string;
  previewParticleColor: string;
};

function EffectPreviewBox({
  effect,
  previewColor,
  previewAccent,
  previewParticleColor,
}: PreviewBoxProps) {
  const [cycle, setCycle] = useState(0);
  const remount = LOOP_ONCE_EFFECTS.has(effect);

  useEffect(() => {
    if (!remount) return;
    const ms = LOOP_INTERVAL_MS[effect] ?? 3000;
    const timer = setInterval(() => setCycle((c) => c + 1), ms);
    return () => clearInterval(timer);
  }, [effect, remount]);

  const text = effect === "morphing" ? MORPHING_PREVIEW_TEXT : PREVIEW_TEXT;

  return (
    <div className="flex min-h-[2.75rem] items-center justify-center overflow-hidden rounded-lg border border-white/[0.06] bg-black/40 px-2 py-2.5">
      <div className="pointer-events-none max-w-full">
        <ProfileAnimatedText
          key={remount ? `${effect}-${cycle}` : effect}
          text={text}
          effect={effect}
          compact
          style={effect === "glitch" ? undefined : { color: previewColor }}
          accentColor={previewAccent}
          particleColor={effect === "particle" ? previewParticleColor : undefined}
        />
      </div>
    </div>
  );
}

type Props = {
  label: string;
  value: TextAnimationId;
  onChange: (id: TextAnimationId) => void;
  previewColor?: string;
  previewAccent?: string;
  previewParticleColor?: string;
};

export function TextAnimationPicker({
  label,
  value,
  onChange,
  previewColor = "#ffffff",
  previewAccent = "#ff2d7a",
  previewParticleColor = "#ff2d7a",
}: Props) {
  const options = TEXT_ANIMATION_IDS.filter((id) => id !== "none");
  const safeValue = normalizeTextAnimationId(value);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-white/55">{label}</label>
        <span className="truncate text-[10px] text-pink-300/80">
          {TEXT_ANIMATION_LABELS[safeValue]}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onChange("none")}
        className={cn(
          "flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition",
          value === "none"
            ? "border-pink-500/50 bg-pink-500/10 text-white"
            : "border-white/[0.08] bg-white/[0.03] text-white/70 hover:border-white/15 hover:bg-white/[0.05]",
        )}
      >
        <span className="font-medium">No effect</span>
        {value === "none" && <Check className="ml-auto h-4 w-4 text-pink-400" />}
      </button>

      <div className="biosy-scrollbar max-h-64 space-y-1.5 overflow-y-auto rounded-xl border border-white/[0.06] bg-black/25 p-1.5">
        {options.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "group flex w-full flex-col gap-2 rounded-lg border px-3 py-2.5 text-left transition",
              value === id
                ? "border-pink-500/50 bg-gradient-to-r from-pink-500/15 to-rose-500/5"
                : "border-transparent bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.05]",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-white/90">{TEXT_ANIMATION_LABELS[id]}</span>
              {value === id ? (
                <Check className="h-4 w-4 shrink-0 text-pink-400" />
              ) : (
                <span className="h-4 w-4 shrink-0 rounded-full border border-white/15 group-hover:border-white/25" />
              )}
            </div>
            <EffectPreviewBox
              effect={id}
              previewColor={previewColor}
              previewAccent={previewAccent}
              previewParticleColor={previewParticleColor}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
