import type { Profile } from "@/lib/profile-storage";
import {
  getEnabledProfileLabels,
  getProfileLabelColor,
  normalizeProfileLabels,
} from "@/lib/profile-labels";
import { hexToRgba } from "@/lib/profile-colors";
import { isCardGlassEnabled } from "@/lib/card-glass";
import { useI18n } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type Props = {
  profile: Profile;
  className?: string;
  align?: "left" | "center";
};

export function ProfileLabelsRow({ profile, className, align = "center" }: Props) {
  const { t } = useI18n();
  const state = normalizeProfileLabels(profile.profile_labels);
  const labels = getEnabledProfileLabels(state);
  const glassEnabled = isCardGlassEnabled(profile);
  if (labels.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5",
        align === "center" ? "justify-center" : "justify-start",
        className,
      )}
      aria-label={t("labels.section")}
    >
      {labels.map((def) => {
        const color = getProfileLabelColor(def.id, state);
        const text = t(`labels.items.${def.id}`);
        return (
          <span
            key={def.id}
            className={cn(
              "inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-tight",
              glassEnabled && "card-glass",
            )}
            style={
              glassEnabled
                ? {
                    borderColor: hexToRgba(color, 0.55),
                    color,
                  }
                : {
                    borderColor: hexToRgba(color, 0.55),
                    color,
                    backgroundColor: hexToRgba(color, 0.14),
                    boxShadow: `0 0 10px ${hexToRgba(color, 0.32)}`,
                  }
            }
          >
            {state.show_emoji ? (
              <span className="shrink-0 text-[12px] leading-none" aria-hidden>
                {def.emoji}
              </span>
            ) : null}
            <span className="truncate">{text}</span>
          </span>
        );
      })}
    </div>
  );
}
