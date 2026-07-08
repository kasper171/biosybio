import type { Profile } from "@/lib/profile-storage";
import { BiosyToggle } from "@/components/ui/BiosyToggle";
import { normalizeOverlayNoiseOpacity } from "@/lib/overlays/profile-overlays";
import { useI18n } from "@/i18n/LocaleProvider";

type Props = {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
};

export function OverlaysPanel({ profile, update }: Props) {
  const { t } = useI18n();
  const enabled = profile.overlay_noise_enabled === true;
  const opacity = normalizeOverlayNoiseOpacity(profile.overlay_noise_opacity);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/45">
          {t("dashboard.overlays.noise.section")}
        </p>
        <p className="mb-4 text-[11px] leading-relaxed text-white/40">
          {t("dashboard.overlays.noise.description")}
        </p>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-white/80">{t("dashboard.overlays.noise.enable")}</span>
          <BiosyToggle
            checked={enabled}
            onChange={(v) => update("overlay_noise_enabled", v)}
            aria-label={t("dashboard.overlays.noise.enable")}
          />
        </div>

        {enabled && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="overlay-noise-opacity" className="text-xs font-medium text-white/55">
                {t("dashboard.overlays.noise.opacity")}
              </label>
              <span className="text-xs tabular-nums text-white/45">{opacity}%</span>
            </div>
            <input
              id="overlay-noise-opacity"
              type="range"
              min={0}
              max={100}
              step={1}
              value={opacity}
              onChange={(e) => update("overlay_noise_opacity", Number(e.target.value))}
              className="w-full accent-pink-500"
            />
            <p className="text-[11px] leading-relaxed text-white/40">
              {t("dashboard.overlays.noise.opacityHint")}
            </p>
          </div>
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-white/35">
        {t("dashboard.overlays.futureHint")}
      </p>
    </div>
  );
}
