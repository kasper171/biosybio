import type { Profile } from "@/lib/profile-storage";
import { OverlayTypePicker } from "@/components/dashboard/OverlayTypePicker";
import {
  normalizeOverlayOpacity,
  normalizeProfileOverlayType,
  type ProfileOverlayType,
} from "@/lib/overlays/profile-overlays";
import { useI18n } from "@/i18n/LocaleProvider";

type Props = {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
};

export function OverlaysPanel({ profile, update }: Props) {
  const { t } = useI18n();
  const activeType = normalizeProfileOverlayType(profile);
  const opacity = normalizeOverlayOpacity(profile.overlay_opacity);

  const labels: Record<ProfileOverlayType, string> = {
    "noise-denso": t("dashboard.overlays.types.noiseDenso"),
    "noise-esparso": t("dashboard.overlays.types.noiseEsparso"),
    scanlines: t("dashboard.overlays.types.scanlines"),
    "film-grain": t("dashboard.overlays.types.filmGrain"),
  };

  const handleSelect = (type: ProfileOverlayType | null) => {
    update("overlay_type", type);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/45">
          {t("dashboard.overlays.section")}
        </p>
        <p className="mb-4 text-[11px] leading-relaxed text-white/40">
          {t("dashboard.overlays.description")}
        </p>

        <p className="mb-2 text-xs font-medium text-white/55">
          {t("dashboard.overlays.selectType")}
        </p>
        <OverlayTypePicker activeType={activeType} onSelect={handleSelect} labels={labels} />
        <p className="mt-2 text-[11px] leading-relaxed text-white/40">
          {t("dashboard.overlays.selectHint")}
        </p>

        {activeType && (
          <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-4">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="overlay-opacity" className="text-xs font-medium text-white/55">
                {t("dashboard.overlays.opacity")}
              </label>
              <span className="text-xs tabular-nums text-white/45">{opacity}%</span>
            </div>
            <input
              id="overlay-opacity"
              type="range"
              min={0}
              max={100}
              step={1}
              value={opacity}
              onChange={(e) => update("overlay_opacity", Number(e.target.value))}
              className="w-full accent-pink-500"
            />
            <p className="text-[11px] leading-relaxed text-white/40">
              {t("dashboard.overlays.opacityHint")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
