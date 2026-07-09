import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Profile } from "@/lib/profile-storage";
import { TapToRevealOverlay } from "@/components/TapToRevealOverlay";
import { ProfileMusicPlayerFloating } from "@/components/ProfileMusicPlayer";
import { ProfileMusicProvider } from "@/contexts/ProfileMusicContext";
import { ProfileWallpaperLayer } from "@/components/ProfileWallpaperLayer";
import { ProfileOverlayLayer } from "@/components/overlays/ProfileOverlayLayer";
import { ProfileByosyBranding } from "@/components/ProfileByosyBranding";
import { useProfileHotelSync } from "@/hooks/useProfileHotelSync";
import { normalizeBackgroundRevealDelaySec } from "@/lib/background-reveal-delay";
import { ensureProfileFontsLoaded } from "@/lib/profile-fonts";

type Props = {
  profile: Profile;
  isEditor?: boolean;
  onProfileChange?: (profile: Profile) => void;
  children: ReactNode;
};

/** Tap-to-reveal, wallpaper, música e overlays — paridade com Card Normal. */
export function AlbumPageExperience({
  profile: profileProp,
  isEditor = false,
  onProfileChange,
  children,
}: Props) {
  const [liveProfile, setLiveProfile] = useState(profileProp);
  const previewRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLiveProfile(profileProp);
  }, [profileProp]);

  useProfileHotelSync(liveProfile, {
    onProfileChange: (next) => {
      setLiveProfile(next);
      onProfileChange?.(next);
    },
  });

  useEffect(() => {
    void ensureProfileFontsLoaded(
      liveProfile.page_font_family ?? "",
      liveProfile.name_font_family ?? "inherit",
    );
  }, [liveProfile.page_font_family, liveProfile.name_font_family]);

  const hasMusic = Boolean(liveProfile.music_url);
  const musicCardMode = hasMusic && liveProfile.music_card_enabled !== false;
  const tapEnabled = hasMusic || liveProfile.tap_to_reveal_enabled === true;
  const wallpaperDelaySec = normalizeBackgroundRevealDelaySec(liveProfile.background_reveal_delay_sec);
  const [revealed, setRevealed] = useState(!tapEnabled || isEditor);
  const [wallpaperVisible, setWallpaperVisible] = useState(
    isEditor || !tapEnabled || wallpaperDelaySec <= 0,
  );
  const wallpaperTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setRevealed(!tapEnabled || isEditor);
    setWallpaperVisible(isEditor || !tapEnabled || wallpaperDelaySec <= 0);
  }, [tapEnabled, isEditor, wallpaperDelaySec, profileProp.id]);

  const showOverlay = tapEnabled && !revealed && !isEditor;
  const showContent = !showOverlay;

  useEffect(() => {
    if (wallpaperTimerRef.current != null) {
      window.clearTimeout(wallpaperTimerRef.current);
      wallpaperTimerRef.current = null;
    }
    if (isEditor || !tapEnabled) {
      setWallpaperVisible(true);
      return;
    }
    if (!showContent) {
      setWallpaperVisible(wallpaperDelaySec <= 0);
      return;
    }
    if (wallpaperDelaySec <= 0) {
      setWallpaperVisible(true);
      return;
    }
    setWallpaperVisible(false);
    wallpaperTimerRef.current = window.setTimeout(() => {
      setWallpaperVisible(true);
      wallpaperTimerRef.current = null;
    }, wallpaperDelaySec * 1000);
    return () => {
      if (wallpaperTimerRef.current != null) {
        window.clearTimeout(wallpaperTimerRef.current);
      }
    };
  }, [showContent, wallpaperDelaySec, tapEnabled, isEditor]);

  const bgUrl = liveProfile.background_url ?? liveProfile.banner_url;
  const fallbackColor = liveProfile.background_color ?? "#0a0a0f";

  const inner = showContent ? children : null;

  const musicPlayerUi =
    showContent && hasMusic && !musicCardMode ? (
      <ProfileMusicPlayerFloating profile={liveProfile} />
    ) : null;

  return (
    <div
      ref={previewRootRef}
      className="album-page-experience relative min-h-full w-full"
      style={{ fontFamily: liveProfile.page_font_family ?? undefined }}
    >
      <ProfileWallpaperLayer
        url={wallpaperVisible ? bgUrl : null}
        fallbackColor={fallbackColor}
        posX={liveProfile.background_pos_x ?? 50}
        posY={liveProfile.background_pos_y ?? 50}
        blur={liveProfile.background_blur ?? 0}
        brightness={liveProfile.background_brightness ?? 100}
      />

      {hasMusic ? (
        <ProfileMusicProvider
          config={{
            musicUrl: liveProfile.music_url!,
            title: liveProfile.music_title ?? undefined,
            startSec: liveProfile.music_start_sec ?? 0,
            endSec: liveProfile.music_end_sec,
            autoplay: !isEditor,
            enabled: showContent,
          }}
        >
          {inner}
          {musicPlayerUi}
        </ProfileMusicProvider>
      ) : (
        inner
      )}

      {showOverlay ? (
        <TapToRevealOverlay
          profile={liveProfile}
          onReveal={() => setRevealed(true)}
          zIndex={50}
          showWallpaperBackground={wallpaperDelaySec <= 0}
        />
      ) : null}

      <ProfileByosyBranding profile={liveProfile} />
      <ProfileOverlayLayer
        profile={liveProfile}
        isEditor={isEditor}
        containerRef={previewRootRef}
      />
    </div>
  );
}
