import type { Profile } from "@/lib/profile-storage";
import { OverlayTypePicker } from "@/components/dashboard/OverlayTypePicker";
import {
  isStaticOverlayType,
  normalizeOverlayColor,
  normalizeOverlayOpacity,
  normalizeOverlaySpacing,
  normalizeOverlayType,
  OVERLAY_SPACING_MAX,
  OVERLAY_SPACING_MIN,
  type ProfileOverlayType,
} from "@/lib/overlays/profile-overlays";
import { useI18n } from "@/i18n/LocaleProvider";

type Props = {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
};

export function OverlaysPanel({ profile, update }: Props) {
  const { t } = useI18n();
  const activeType = normalizeOverlayType(profile.overlay_type);
  const opacity = normalizeOverlayOpacity(profile.overlay_opacity);
  const color = normalizeOverlayColor(profile.overlay_color);
  const spacing = normalizeOverlaySpacing(profile.overlay_spacing);
  const showStaticControls = activeType !== null && isStaticOverlayType(activeType);

  const labels: Record<ProfileOverlayType, string> = {
    "noise-denso": t("dashboard.overlays.types.noiseDenso"),
    "noise-esparso": t("dashboard.overlays.types.noiseEsparso"),
    scanlines: t("dashboard.overlays.types.scanlines"),
    "film-grain": t("dashboard.overlays.types.filmGrain"),
    "diagonal-stripes": t("dashboard.overlays.types.diagonalStripes"),
    "cyber-grid": t("dashboard.overlays.types.cyberGrid"),
    "dot-pattern": t("dashboard.overlays.types.dotPattern"),
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
        <OverlayTypePicker
          activeType={activeType}
          onSelect={handleSelect}
          labels={labels}
          previewColor={color}
          previewSpacing={spacing}
        />
        <p className="mt-2 text-[11px] leading-relaxed text-white/40">
          {t("dashboard.overlays.selectHint")}
        </p>

        {activeType && (
          <div className="mt-4 space-y-4 border-t border-white/[0.06] pt-4">
            <div className="space-y-2">
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

            {showStaticControls && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/55">
                    {t("dashboard.overlays.textureColor")}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => update("overlay_color", e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
                    />
                    <input
                      value={color}
                      onChange={(e) => update("overlay_color", e.target.value)}
                      className="flex-1 rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-pink-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="overlay-spacing" className="text-xs font-medium text-white/55">
                      {t("dashboard.overlays.spacing")}
                    </label>
                    <span className="text-xs tabular-nums text-white/45">{spacing}px</span>
                  </div>
                  <input
                    id="overlay-spacing"
                    type="range"
                    min={OVERLAY_SPACING_MIN}
                    max={OVERLAY_SPACING_MAX}
                    step={1}
                    value={spacing}
                    onChange={(e) => update("overlay_spacing", Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                  <p className="text-[11px] leading-relaxed text-white/40">
                    {t("dashboard.overlays.spacingHint")}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
