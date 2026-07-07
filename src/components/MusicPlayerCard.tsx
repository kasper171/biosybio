import type { CSSProperties } from "react";
import { Music2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { Profile } from "@/lib/profile-storage";
import { resolveMusicCardTitle } from "@/lib/profile-music";
import { useProfileMusic } from "@/contexts/ProfileMusicContext";
import {
  buildCardGlowShadow,
  buildCardSolidBorderShadow,
  cardBorderStyleClass,
  combineBoxShadows,
  normalizeCardBorderStyle,
} from "@/lib/card-border";
import { getDiscordMutedStyle, getDiscordTitleStyle, hexToRgba } from "@/lib/profile-colors";

type Props = {
  profile: Profile;
  className?: string;
};

function getMusicCardChrome(profile: Profile): { style: CSSProperties; className: string } {
  const bw = Number(profile.card_border_width ?? 0);
  const bc = profile.card_border_color ?? "#ffffff";
  const borderStyle = normalizeCardBorderStyle(profile.card_border_style);
  const radius = Math.min(Number(profile.card_border_radius ?? 16), 20);
  const useCssBorder = bw > 0;

  const style: CSSProperties = {
    borderRadius: radius,
    background: hexToRgba(profile.card_color, profile.card_opacity),
    backdropFilter: `blur(${profile.card_blur}px)`,
    WebkitBackdropFilter: `blur(${profile.card_blur}px)`,
    boxSizing: "border-box",
    boxShadow: combineBoxShadows(
      useCssBorder ? null : buildCardSolidBorderShadow(bw, bc),
      buildCardGlowShadow(
        Boolean(profile.effect_glow),
        profile.effect_glow_color ?? profile.card_border_color,
        profile.effect_glow_size ?? 24,
      ),
    ),
  };

  if (useCssBorder) {
    style.borderWidth = bw;
    style.borderStyle = borderStyle;
    style.borderColor = bc;
  }

  return {
    style,
    className: useCssBorder ? cardBorderStyleClass(borderStyle) : "",
  };
}

export function MusicPlayerCard({ profile, className = "" }: Props) {
  const {
    trackTitle,
    seekMin,
    seekMax,
    current,
    isPlaying,
    volume,
    formatTime,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
  } = useProfileMusic();

  const chrome = getMusicCardChrome(profile);
  const displayTitle = resolveMusicCardTitle(
    profile.music_card_title,
    profile.music_title,
    profile.music_url ?? "",
  );
  const subtitle = profile.music_card_subtitle?.trim();
  const artUrl = profile.music_card_art_url;
  const titleStyle = getDiscordTitleStyle(profile);
  const mutedStyle = getDiscordMutedStyle(profile);
  const iconColor = profile.icon_color ?? "rgba(255,255,255,0.85)";

  return (
    <div
      className={`relative mx-auto w-full px-3 py-2.5 sm:px-4 sm:py-3 ${chrome.className} ${className}`}
      style={chrome.style}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={togglePlay}
          className={`relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-black/25 transition hover:scale-[1.03] hover:bg-black/35 sm:h-16 sm:w-16 ${
            isPlaying ? "animate-[biosy-music-pulse_1.2s_ease-in-out_infinite]" : ""
          }`}
          title={isPlaying ? "Pausar" : "Tocar"}
        >
          {artUrl ? (
            <img src={artUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <Music2 className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: iconColor }} />
          )}
          <span className="absolute inset-0 grid place-items-center bg-black/35 opacity-0 transition hover:opacity-100">
            {isPlaying ? (
              <Pause className="h-5 w-5 text-white" />
            ) : (
              <Play className="h-5 w-5 text-white" />
            )}
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold sm:text-base" style={titleStyle}>
            {displayTitle}
          </p>
          {subtitle ? (
            <p className="truncate text-xs sm:text-sm" style={mutedStyle}>
              {subtitle}
            </p>
          ) : (
            <p className="truncate text-xs" style={mutedStyle}>
              {trackTitle !== displayTitle ? trackTitle : "Tocando agora"}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <span className="shrink-0 text-[10px] tabular-nums sm:text-xs" style={mutedStyle}>
              {formatTime(current)}
            </span>
            <input
              type="range"
              min={seekMin}
              max={seekMax}
              step={0.01}
              value={Math.min(Math.max(current, seekMin), seekMax)}
              onChange={(e) => seek(Number(e.target.value))}
              className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-white"
              aria-label="Progresso da faixa"
            />
            <span className="shrink-0 text-[10px] tabular-nums sm:text-xs" style={mutedStyle}>
              {formatTime(seekMax)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={togglePlay}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white/90 transition hover:bg-white/10"
            title={isPlaying ? "Pausar" : "Tocar"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="grid h-8 w-8 place-items-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white"
            title="Mutar / desmutar"
          >
            {volume <= 0.001 ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1 w-12 cursor-pointer appearance-none rounded-full bg-white/20 accent-white"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
