import { useEffect, useState } from "react";
import type { Profile } from "@/lib/profile-storage";
import { ensureProfileFontsLoaded } from "@/lib/profile-fonts";
import { ProfilePageContent } from "@/components/ProfilePageContent";
import { TapToRevealOverlay } from "@/components/TapToRevealOverlay";
import { ProfileMusicPlayerFloating } from "@/components/ProfileMusicPlayer";
import { ProfileMusicProvider } from "@/contexts/ProfileMusicContext";
import { useProfileBlocks } from "@/hooks/useProfileBlocks";
import { useProfilePageMeta } from "@/hooks/useProfilePageMeta";
import type { ProfileBlock } from "@/lib/profile-blocks";

type Props = {
  profile: Profile;
  /** No editor, overlay fica abaixo da UI de ferramentas. */
  isEditor?: boolean;
  /** Blocos injetados pelo dashboard (evita fetch duplicado). */
  blocks?: ProfileBlock[];
  onProfileChange?: (profile: Profile) => void;
};

export function PublicProfileView({ profile, isEditor, blocks: blocksProp, onProfileChange }: Props) {
  const { blocks: fetchedBlocks } = useProfileBlocks(blocksProp ? null : profile.id);
  const blocks = blocksProp ?? fetchedBlocks;
  const [liveProfile, setLiveProfile] = useState(profile);
  const hasMusic = Boolean(liveProfile.music_url);
  const musicCardMode = hasMusic && liveProfile.music_card_enabled !== false;
  const tapEnabled = hasMusic || liveProfile.tap_to_reveal_enabled === true;
  const [revealed, setRevealed] = useState(!tapEnabled);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setLiveProfile(profile);
  }, [profile]);

  useProfileHotelSync(liveProfile, {
    onProfileChange: (next) => {
      setLiveProfile(next);
      onProfileChange?.(next);
    },
  });

  useEffect(() => {
    ensureProfileFontsLoaded(
      liveProfile.page_font_family ?? "",
      liveProfile.name_font_family ?? "inherit",
    );
  }, [liveProfile.page_font_family, liveProfile.name_font_family]);

  useEffect(() => {
    setRevealed(!tapEnabled);
    setAnimKey((k) => k + 1);
  }, [
    tapEnabled,
    liveProfile.tap_reveal_blur,
    liveProfile.tap_reveal_brightness,
    liveProfile.tap_reveal_mode,
    liveProfile.tap_reveal_text,
    liveProfile.card_reveal_effect,
    liveProfile.music_url,
    liveProfile.music_start_sec,
    liveProfile.music_end_sec,
    liveProfile.music_card_enabled,
  ]);

  const showOverlay = tapEnabled && !revealed;
  const showContent = !showOverlay;

  useProfilePageMeta(liveProfile, {
    enabled: showContent,
    animationSeed: animKey,
  });

  const handleReveal = () => {
    setRevealed(true);
    setAnimKey((k) => k + 1);
  };

  const pageContent = showContent ? (
    <ProfilePageContent
      profile={liveProfile}
      blocks={blocks}
      animate={!isEditor}
      animKey={animKey}
      isEditor={isEditor}
    />
  ) : null;

  const musicPlayerUi =
    showContent && hasMusic && !musicCardMode ? <ProfileMusicPlayerFloating /> : null;

  return (
    <div
      className="relative min-h-screen w-full"
      style={{ fontFamily: liveProfile.page_font_family }}
    >
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
          {pageContent}
          {musicPlayerUi}
        </ProfileMusicProvider>
      ) : (
        pageContent
      )}
      {showOverlay && (
        <TapToRevealOverlay
          profile={liveProfile}
          onReveal={handleReveal}
          zIndex={isEditor ? 20 : 50}
        />
      )}
    </div>
  );
}
