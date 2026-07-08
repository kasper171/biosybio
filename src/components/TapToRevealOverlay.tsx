import { User } from "lucide-react";
import type { Profile } from "@/lib/profile-storage";
import { AvatarWithFrame } from "@/components/AvatarWithFrame";
import { ProfileWallpaperLayer } from "@/components/ProfileWallpaperLayer";
import { imageObjectPosition } from "@/lib/image-position";
import { useI18n } from "@/i18n/LocaleProvider";

type Props = {
  profile: Profile;
  onReveal: () => void;
  zIndex?: number;
};

export function TapToRevealOverlay({ profile, onReveal, zIndex = 50 }: Props) {
  const { t } = useI18n();
  const blur = profile.tap_reveal_blur ?? 20;
  const brightness = profile.tap_reveal_brightness ?? 55;
  const mode = profile.tap_reveal_mode ?? "avatar_text";
  const text = profile.tap_reveal_text?.trim() || t("profile.tapToReveal");

  return (
    <button
      type="button"
      onClick={onReveal}
      className="fixed inset-0 flex cursor-pointer items-center justify-center border-0 bg-transparent p-6 transition-opacity duration-300"
      style={{ zIndex }}
      aria-label={t("profile.revealAria")}
    >
      <ProfileWallpaperLayer
        url={profile.background_url}
        fallbackColor={profile.background_color}
        posX={profile.background_pos_x ?? 50}
        posY={profile.background_pos_y ?? 50}
        blur={blur}
        brightness={brightness}
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-black/45" />

      <div className="relative z-[1] flex max-w-sm flex-col items-center gap-4 text-center">
        {mode === "avatar_text" && (
          <AvatarWithFrame size={96} frameId={profile.avatar_frame_id}>
            <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-white/30 bg-white/10 shadow-lg backdrop-blur-sm">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: imageObjectPosition(
                      profile.avatar_pos_x ?? 50,
                      profile.avatar_pos_y ?? 50,
                    ),
                  }}
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-white/40">
                  <User className="h-10 w-10" strokeWidth={1.25} aria-hidden />
                </div>
              )}
            </div>
          </AvatarWithFrame>
        )}
        <p className="text-lg font-semibold tracking-wide text-white drop-shadow-md sm:text-xl">
          {text}
        </p>
        <p className="text-xs text-white/50">{t("profile.tapContinue")}</p>
      </div>
    </button>
  );
}
