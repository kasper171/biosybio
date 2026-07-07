import { useEffect, useState } from "react";
import type { Profile } from "@/lib/profile-storage";
import { ensureProfileFontsLoaded } from "@/lib/profile-fonts";
import { ProfilePageContent } from "@/components/ProfilePageContent";
import { TapToRevealOverlay } from "@/components/TapToRevealOverlay";
import { ProfileMusicPlayerFloating } from "@/components/ProfileMusicPlayer";
import { ProfileMusicProvider } from "@/contexts/ProfileMusicContext";
import { useProfileBlocks } from "@/hooks/useProfileBlocks";
import type { ProfileBlock } from "@/lib/profile-blocks";

type Props = {
  profile: Profile;
  /** No editor, overlay fica abaixo da UI de ferramentas. */
  isEditor?: boolean;
  /** Blocos injetados pelo dashboard (evita fetch duplicado). */
  blocks?: ProfileBlock[];
};

export function PublicProfileView({ profile, isEditor, blocks: blocksProp }: Props) {
  const { blocks: fetchedBlocks } = useProfileBlocks(blocksProp ? null : profile.id);
  const blocks = blocksProp ?? fetchedBlocks;
  const hasMusic = Boolean(profile.music_url);
  const musicCardMode = hasMusic && profile.music_card_enabled !== false;
  const tapEnabled = hasMusic || profile.tap_to_reveal_enabled === true;
  const [revealed, setRevealed] = useState(!tapEnabled);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    ensureProfileFontsLoaded(
      profile.page_font_family ?? "",
      profile.name_font_family ?? "inherit",
    );
  }, [profile.page_font_family, profile.name_font_family]);

  useEffect(() => {
    setRevealed(!tapEnabled);
    setAnimKey((k) => k + 1);
  }, [
    tapEnabled,
    profile.tap_reveal_blur,
    profile.tap_reveal_brightness,
    profile.tap_reveal_mode,
    profile.tap_reveal_text,
    profile.card_reveal_effect,
    profile.music_url,
    profile.music_start_sec,
    profile.music_end_sec,
    profile.music_card_enabled,
  ]);

  const showOverlay = tapEnabled && !revealed;
  const showContent = !showOverlay;

  const handleReveal = () => {
    setRevealed(true);
    setAnimKey((k) => k + 1);
  };

  const pageContent = showContent ? (
    <ProfilePageContent
      profile={profile}
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
      style={{ fontFamily: profile.page_font_family }}
    >
      {hasMusic ? (
        <ProfileMusicProvider
          config={{
            musicUrl: profile.music_url!,
            title: profile.music_title ?? undefined,
            startSec: profile.music_start_sec ?? 0,
            endSec: profile.music_end_sec,
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
          profile={profile}
          onReveal={handleReveal}
          zIndex={isEditor ? 20 : 50}
        />
      )}
    </div>
  );
}
