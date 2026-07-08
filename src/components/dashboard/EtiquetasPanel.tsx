import { useState } from "react";
import { Check } from "lucide-react";
import type { Profile } from "@/lib/profile-storage";
import {
  getProfileLabelColor,
  normalizeProfileLabels,
  PROFILE_LABEL_CATALOG,
  type ProfileLabelId,
  type ProfileLabelsState,
} from "@/lib/profile-labels";
import { useI18n } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type Props = {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
};

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-white/55">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-pink-500/50"
        />
      </div>
    </div>
  );
}

export function EtiquetasPanel({ profile, update }: Props) {
  const { t } = useI18n();
  const labelsState = normalizeProfileLabels(profile.profile_labels);
  const [selectedId, setSelectedId] = useState<ProfileLabelId | null>(
    labelsState.enabled[0] ?? null,
  );

  const setLabelsState = (next: ProfileLabelsState) => {
    update("profile_labels", next);
  };

  const handleLabelClick = (id: ProfileLabelId) => {
    const isEnabled = labelsState.enabled.includes(id);
    if (isEnabled) {
      if (selectedId === id) {
        setLabelsState({
          ...labelsState,
          enabled: labelsState.enabled.filter((x) => x !== id),
        });
        setSelectedId((prev) => (prev === id ? labelsState.enabled.find((x) => x !== id) ?? null : prev));
        return;
      }
      setSelectedId(id);
      return;
    }
    setLabelsState({
      ...labelsState,
      enabled: [...labelsState.enabled, id],
    });
    setSelectedId(id);
  };

  const selectedColor = selectedId
    ? getProfileLabelColor(selectedId, labelsState)
    : "#ffffff";

  const setSelectedColor = (color: string) => {
    if (!selectedId) return;
    setLabelsState({
      ...labelsState,
      colors: { ...labelsState.colors, [selectedId]: color },
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/45">
          {t("dashboard.etiquetas.displayMode")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setLabelsState({ ...labelsState, show_emoji: true })}
            className={cn(
              "rounded-lg px-3 py-2 text-xs font-medium transition",
              labelsState.show_emoji
                ? "bg-white text-black"
                : "bg-white/[0.03] text-white/65 hover:bg-white/[0.06]",
            )}
          >
            {t("dashboard.etiquetas.textWithEmoji")}
          </button>
          <button
            type="button"
            onClick={() => setLabelsState({ ...labelsState, show_emoji: false })}
            className={cn(
              "rounded-lg px-3 py-2 text-xs font-medium transition",
              !labelsState.show_emoji
                ? "bg-white text-black"
                : "bg-white/[0.03] text-white/65 hover:bg-white/[0.06]",
            )}
          >
            {t("dashboard.etiquetas.textOnly")}
          </button>
        </div>
      </div>

      {selectedId && labelsState.enabled.includes(selectedId) ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
          <ColorField
            label={t("dashboard.etiquetas.colorForSelected", {
              label: t(`labels.items.${selectedId}`),
            })}
            value={selectedColor}
            onChange={setSelectedColor}
          />
          <p className="mt-2 text-[11px] leading-relaxed text-white/40">
            {t("dashboard.etiquetas.colorHint")}
          </p>
        </div>
      ) : (
        <p className="text-xs text-white/45">{t("dashboard.etiquetas.selectActiveHint")}</p>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/45">
          {t("dashboard.etiquetas.choose")}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {PROFILE_LABEL_CATALOG.map((def) => {
            const isEnabled = labelsState.enabled.includes(def.id);
            const isSelected = selectedId === def.id;
            const color = getProfileLabelColor(def.id, labelsState);
            const labelText = t(`labels.items.${def.id}`);
            return (
              <button
                key={def.id}
                type="button"
                onClick={() => handleLabelClick(def.id)}
                title={labelText}
                className={cn(
                  "relative rounded-xl border px-2 py-2.5 text-left transition",
                  isEnabled ? "opacity-100" : "opacity-40 hover:opacity-65",
                  isSelected
                    ? "border-pink-400/70 ring-2 ring-pink-400/35"
                    : isEnabled
                      ? "border-white/20 bg-white/[0.04] hover:bg-white/[0.07]"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/15",
                )}
                style={
                  isEnabled
                    ? {
                        boxShadow: isSelected
                          ? `0 0 16px ${color}55, inset 0 0 12px ${color}18`
                          : `0 0 8px ${color}30`,
                      }
                    : undefined
                }
              >
                <span
                  className="mb-1 block text-[11px] font-semibold leading-tight"
                  style={{ color: isEnabled ? color : "rgba(255,255,255,0.55)" }}
                >
                  {labelsState.show_emoji ? `${def.emoji} ` : ""}
                  {labelText}
                </span>
                {isEnabled && (
                  <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-green-500 text-white">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-white/40">
          {t("dashboard.etiquetas.chooseHint")}
        </p>
      </div>
    </div>
  );
}
