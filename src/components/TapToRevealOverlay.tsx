import { User } from "lucide-react";
import type { Profile } from "@/lib/profile-storage";
import { AvatarWithFrame } from "@/components/AvatarWithFrame";

type Props = {
  profile: Profile;
  onReveal: () => void;
  zIndex?: number;
};

export function TapToRevealOverlay({ profile, onReveal, zIndex = 50 }: Props) {
  const blur = profile.tap_reveal_blur ?? 20;
  const brightness = profile.tap_reveal_brightness ?? 55;
  const mode = profile.tap_reveal_mode ?? "avatar_text";
  const text = profile.tap_reveal_text?.trim() || "Tap to reveal";

  return (
    <button
      type="button"
      onClick={onReveal}
      className="fixed inset-0 flex cursor-pointer items-center justify-center border-0 bg-transparent p-6 transition-opacity duration-300"
      style={{ zIndex }}
      aria-label="Reveal profile"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background: profile.background_url
            ? `url(${profile.background_url}) center/cover no-repeat`
            : profile.background_color,
          filter: `blur(${blur}px) brightness(${brightness}%)`,
          transform: blur > 0 ? "scale(1.08)" : undefined,
        }}
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
        <p className="text-xs text-white/50">Click or tap to continue</p>
      </div>
    </button>
  );
}
