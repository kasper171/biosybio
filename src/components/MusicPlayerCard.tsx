import type { CSSProperties } from "react";
import { Music2, Pause, Play } from "lucide-react";
import type { Profile } from "@/lib/profile-storage";
import { resolveMusicCardTitle } from "@/lib/profile-music";
import { useProfileMusic } from "@/contexts/ProfileMusicContext";
import { MusicVolumeControl } from "@/components/MusicVolumeControl";
import { buildCardBorderChrome, normalizeCardBorderStyle } from "@/lib/card-border";
import {
  cardGlassClass,
  cardGlassSurfaceLayerStyle,
  cardSurfaceFillStyle,
  isCardGlassEnabled,
} from "@/lib/card-glass";
import { getDiscordMutedStyle, getDiscordTitleStyle, hexToRgba } from "@/lib/profile-colors";

type Props = {
  profile: Profile;
  className?: string;
};

function getMusicCardChrome(profile: Profile): {
  outer: { style: CSSProperties; className: string };
  innerRadius: number;
  surfaceBg: string;
} {
  const borderWidth = Number(profile.card_border_width ?? 0) || 0;
  const borderColor = profile.card_border_color ?? "#ffffff";
  // Arredondamento GLOBAL — 0 deve permanecer 0
  const radiusRaw = Number(profile.card_border_radius ?? 16);
  const radius = Number.isFinite(radiusRaw) ? radiusRaw : 16;

  const borderChrome = buildCardBorderChrome({
    borderWidth,
    borderColor,
    borderRadius: radius,
    borderStyle: profile.card_border_style,
    glowEnabled: Boolean(profile.effect_glow),
    glowColor: profile.effect_glow_color ?? profile.card_border_color,
    glowSize: profile.effect_glow_size ?? 24,
  });

  const useCssBorder = borderWidth > 0 && normalizeCardBorderStyle(profile.card_border_style) !== "solid";
  const innerRadius = useCssBorder ? Math.max(0, radius - borderWidth) : radius;
  const surfaceBg = hexToRgba(profile.card_color, profile.card_opacity);

  return {
    outer: {
      className: borderChrome.className,
      style: {
        ...borderChrome.style,
        // background/blur ficam na camada interna (evita blur afetar glow)
        background: "transparent",
      },
    },
    innerRadius,
    surfaceBg,
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
  const glassEnabled = isCardGlassEnabled(profile);
  const surfaceProps = {
    className: cardGlassClass(profile),
    style: {
      ...cardGlassSurfaceLayerStyle(chrome.innerRadius),
      ...cardSurfaceFillStyle(profile, glassEnabled),
    },
  };

  return (
    <div
      className={`relative mx-auto w-full ${chrome.outer.className} ${className}`}
      style={chrome.outer.style}
    >
      <div
        className="relative overflow-hidden px-3 py-2.5 sm:px-4 sm:py-3"
        style={{ borderRadius: chrome.innerRadius }}
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0${surfaceProps.className ? ` ${surfaceProps.className}` : ""}`}
          style={surfaceProps.style}
        />

        <div className="relative z-10 flex items-center gap-3 sm:gap-4 pointer-events-auto">
        <button
          type="button"
          onClick={togglePlay}
          className={`relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-black/25 transition hover:scale-[1.03] hover:bg-black/35 sm:h-16 sm:w-16 ${
            isPlaying ? "animate-[biosy-music-pulse_1.2s_ease-in-out_infinite]" : ""
          }`}
          title={isPlaying ? "Pause" : "Play"}
        >
          {artUrl ? (
            <img src={artUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <Music2 className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: iconColor }} />
          )}
          <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/35 opacity-0 transition hover:opacity-100">
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
              {trackTitle !== displayTitle ? trackTitle : "Now playing"}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <span className="shrink-0 text-[10px] tabular-nums sm:text-xs" style={mutedStyle}>
              {formatTime(current)}
            </span>
            <div className="biosy-range-wrap min-w-0 flex-1 py-0">
              <input
                type="range"
                min={seekMin}
                max={seekMax}
                step={0.01}
                value={Math.min(Math.max(current, seekMin), seekMax)}
                onInput={(e) => seek(Number(e.currentTarget.value))}
                onChange={(e) => seek(Number(e.currentTarget.value))}
                className="biosy-range-input w-full"
                aria-label="Track progress"
              />
            </div>
            <span className="shrink-0 text-[10px] tabular-nums sm:text-xs" style={mutedStyle}>
              {formatTime(seekMax)}
            </span>
            <MusicVolumeControl
              volume={volume}
              onVolumeChange={setVolume}
              onToggleMute={toggleMute}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={togglePlay}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white/90 transition hover:bg-white/10"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
