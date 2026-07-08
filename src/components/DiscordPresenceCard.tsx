import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { FaDiscord } from "react-icons/fa";
import type { Profile } from "@/lib/profile-storage";
import {
  buildCardBorderChrome,
} from "@/lib/card-border";
import {
  getDiscordBodyStyle,
  getDiscordMutedStyle,
  getDiscordTitleStyle,
  getIconColorStyle,
  getTextGlowStyle,
  hexToRgba,
} from "@/lib/profile-colors";
import { cn } from "@/lib/utils";
import type {
  DiscordBadge,
  DiscordPresenceSlice,
  DiscordUser,
  LanyardActivity,
} from "@/lib/discord/discord-payload";
import { getDiscordDcdnProfileFn } from "@/lib/discord/discord.functions";
import { useDiscordPresenceRelay } from "@/lib/discord/use-discord-presence-relay";

/** Abaixo desta largura, a atividade (Spotify etc.) encolhe para não sobrepor o perfil */
const ACTIVITY_COMPACT_WIDTH_PX = 400;

type DiscordPresenceData = {
  user: DiscordUser;
  badges: DiscordBadge[];
  activities: LanyardActivity[];
  spotify: DiscordPresenceSlice["spotify"];
};

const DISCORD_CACHE_TTL_MS = 1000 * 60 * 10;

function cacheKey(userId: string): string {
  return `biosy_discord_presence_${userId}`;
}

function readCachedPresence(userId: string): DiscordPresenceData | null {
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts?: number; data?: DiscordPresenceData };
    if (!parsed?.ts || !parsed?.data) return null;
    if (Date.now() - parsed.ts > DISCORD_CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCachedPresence(userId: string, data: DiscordPresenceData) {
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // ignore quota errors
  }
}

function getDefaultAvatar(discriminator?: string): string {
  const idx = Number(discriminator ?? "0") % 5;
  return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
}

function getAvatarUrl(user: DiscordUser): string {
  if (!user.avatar) return getDefaultAvatar(user.discriminator);
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
}

function getActivityArt(activity: LanyardActivity): string | null {
  const image = activity.assets?.large_image;
  if (!image) return null;
  if (image.startsWith("mp:")) {
    return `https://media.discordapp.net/${image.slice(3)}`;
  }
  if (activity.application_id) {
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${image}.png?size=256`;
  }
  return null;
}

function formatMs(ms: number): string {
  const safe = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function DiscordPresenceCard({
  userId,
  variant = "inside",
  profileTheme,
  showBadges = true,
  scale = 100,
}: {
  userId: string;
  variant?: "inside" | "outside";
  profileTheme?: Profile;
  showBadges?: boolean;
  /** Escala visual do bloco (80–140). */
  scale?: number;
}) {
  const [data, setData] = useState<DiscordPresenceData | null>(() => readCachedPresence(userId));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    const cached = readCachedPresence(userId);
    if (cached) setData(cached);

    void getDiscordDcdnProfileFn({ data: { userId } })
      .then((profile) => {
        if (!active || !profile) return;
        setData((prev) => {
          const next: DiscordPresenceData = {
            user: profile.user,
            badges: profile.badges,
            activities: prev?.activities ?? [],
            spotify: prev?.spotify ?? null,
          };
          writeCachedPresence(userId, next);
          return next;
        });
      })
      .catch((error) => {
        console.warn("[DiscordPresenceCard] dcdn profile fetch", error);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  useDiscordPresenceRelay(userId, (presence) => {
    setData((prev) => {
      const base: DiscordPresenceData = prev ?? {
        user: { id: userId, username: "discord", global_name: null, avatar: null },
        badges: [],
        activities: [],
        spotify: null,
      };
      const lanyardUser = presence.discord_user;
      const isPlaceholder =
        base.user.username === "discord" && !base.user.avatar && !base.user.global_name;
      const next = {
        ...base,
        user: lanyardUser && isPlaceholder ? lanyardUser : base.user,
        activities: presence.activities,
        spotify: presence.spotify,
      };
      writeCachedPresence(userId, next);
      return next;
    });
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const user = data?.user;
  const fallbackUser: DiscordUser = useMemo(
    () => ({ id: userId, username: "discord", global_name: null, avatar: null }),
    [userId],
  );
  const safeUser = user ?? fallbackUser;

  const spotify = data?.spotify ?? null;
  const richActivity = (data?.activities ?? []).find((a) => a.name && a.name !== "Custom Status");
  const hasActivity = Boolean(spotify || richActivity);
  const badges = data?.badges ?? [];

  const activityTitle = spotify?.song ?? richActivity?.details ?? richActivity?.name ?? "";
  const activitySubtitle = spotify
    ? `${spotify.artist} — ${spotify.album}`
    : (richActivity?.state ?? "");
  const activityArt = spotify?.album_art_url ?? (richActivity ? getActivityArt(richActivity) : null);

  const layoutRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(ACTIVITY_COMPACT_WIDTH_PX);

  useEffect(() => {
    const el = layoutRef.current;
    if (!el) return;

    const update = () => {
      setContainerWidth(el.getBoundingClientRect().width);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasActivity, variant]);

  const isCompactActivity = hasActivity && containerWidth < ACTIVITY_COMPACT_WIDTH_PX;
  const activityCompactRatio = isCompactActivity
    ? Math.max(0.45, containerWidth / ACTIVITY_COMPACT_WIDTH_PX)
    : 1;
  /** Perfil Discord encolhe levemente só para caber; nomes nunca são cortados */
  const profileCompactRatio = isCompactActivity
    ? Math.max(0.82, containerWidth / ACTIVITY_COMPACT_WIDTH_PX)
    : 1;
  const spotifyStart = spotify?.timestamps?.start ?? null;
  const spotifyEnd = spotify?.timestamps?.end ?? null;
  const spotifyDuration = spotifyStart && spotifyEnd ? Math.max(spotifyEnd - spotifyStart, 0) : 0;
  const spotifyElapsed = spotifyStart ? Math.max(now - spotifyStart, 0) : 0;
  const spotifyProgress = spotifyDuration > 0
    ? Math.min(Math.max(spotifyElapsed / spotifyDuration, 0), 1)
    : 0;

  const outsideBw = Number(profileTheme?.card_border_width ?? 0);
  const outsideBr = profileTheme?.card_border_radius ?? 16;
  const outsideBc = profileTheme?.card_border_color ?? "#ffffff";

  const outsideBorderChrome =
    variant === "outside" && profileTheme
      ? buildCardBorderChrome({
          borderWidth: outsideBw,
          borderColor: outsideBc,
          borderRadius: outsideBr,
          borderStyle: profileTheme.card_border_style,
          glowEnabled: Boolean(profileTheme.effect_glow),
          glowColor: profileTheme.effect_glow_color ?? profileTheme.card_border_color,
          glowSize: profileTheme.effect_glow_size ?? 24,
        })
      : null;

  const outsideShellStyle: CSSProperties | undefined =
    outsideBorderChrome
      ? outsideBorderChrome.style
      : undefined;

  const outsideSurfaceStyle: CSSProperties | undefined =
    variant === "outside" && profileTheme
      ? {
          background: hexToRgba(profileTheme.card_color, profileTheme.card_opacity),
          backdropFilter: `blur(${profileTheme.card_blur}px)`,
          WebkitBackdropFilter: `blur(${profileTheme.card_blur}px)`,
          borderRadius: outsideBr,
        }
      : undefined;

  const rootClass =
    variant === "outside"
      ? "relative isolate box-border w-full max-w-full min-w-0"
      : "w-full";

  const contentClass =
    variant === "outside" ? "relative z-[1] overflow-hidden px-4 py-3" : "relative z-[1]";

  const scaleFactor = Math.min(140, Math.max(80, scale)) / 100;
  const avatarPx = Math.round(52 * scaleFactor);
  const namePx = Math.round(16 * scaleFactor);
  const userPx = Math.round(14 * scaleFactor);
  const badgePx = Math.round(19.2 * scaleFactor);
  const headerPx = Math.round(10 * scaleFactor);
  const activityTitlePx = Math.round(14 * scaleFactor);
  const activitySubPx = Math.round(12 * scaleFactor);
  const activityArtPx = Math.round(48 * scaleFactor);
  const effAvatarPx = Math.max(40, Math.round(avatarPx * profileCompactRatio));
  const effNamePx = Math.max(12, Math.round(namePx * profileCompactRatio));
  const effUserPx = Math.max(11, Math.round(userPx * profileCompactRatio));
  const effBadgePx = Math.max(11, Math.round(badgePx * profileCompactRatio));
  const effActivityTitlePx = Math.max(8, Math.round(activityTitlePx * activityCompactRatio));
  const effActivitySubPx = Math.max(7, Math.round(activitySubPx * activityCompactRatio));
  const effActivityArtPx = Math.max(22, Math.round(activityArtPx * activityCompactRatio));
  const effProgressW = Math.max(48, Math.round(170 * scaleFactor * activityCompactRatio));
  const showProgressTimes = !isCompactActivity || containerWidth >= 320;
  const showActivitySubtitle = !isCompactActivity || containerWidth >= 260;
  const profileLinkPx = Math.round(14 * scaleFactor);
  const iconPx = Math.round(12 * scaleFactor);

  const titleBase = profileTheme ? getDiscordTitleStyle(profileTheme) : undefined;
  const titleGlow = profileTheme ? getTextGlowStyle(profileTheme, 1, "discord_title") : undefined;
  const bodyBase = profileTheme ? getDiscordBodyStyle(profileTheme) : undefined;
  const mutedStyle = profileTheme ? getDiscordMutedStyle(profileTheme) : undefined;
  const iconStyle = profileTheme ? getIconColorStyle(profileTheme) : undefined;
  const discordMutedGlow = profileTheme ? getTextGlowStyle(profileTheme, 0.75, "discord_muted") : undefined;
  const discordBodyGlow = profileTheme ? getTextGlowStyle(profileTheme, 0.75, "discord_body") : undefined;
  const headerMuted = mutedStyle ?? { color: "rgba(255,255,255,0.40)" };
  const titleFallback = titleBase ?? { color: "#ffffff" };
  const titleGlowFallback = titleGlow ?? {};
  const mutedFallback = mutedStyle ?? { color: "rgba(255,255,255,0.60)" };
  const bodyFallback = bodyBase ?? { color: "rgba(255,255,255,0.80)" };
  const iconFallback = iconStyle ?? { color: "rgba(255,255,255,0.40)" };

  const cardBody = (
    <>
      <div className="relative z-[1] mb-1.5 flex items-center gap-1" style={{ fontSize: headerPx }}>
        <FaDiscord className="shrink-0" style={{ ...iconFallback, width: iconPx, height: iconPx }} aria-hidden />
        <span className="font-medium uppercase tracking-wider" style={headerMuted}>
          Discord
        </span>
      </div>
      <div
        ref={layoutRef}
        className={cn(
          "relative z-[1] flex min-w-0 items-center",
          hasActivity ? (isCompactActivity ? "gap-1.5" : "justify-between gap-3") : "justify-between gap-3",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center",
            isCompactActivity ? "gap-2" : "gap-3",
          )}
        >
          <img
            src={getAvatarUrl(safeUser)}
            alt={safeUser.username}
            className="shrink-0 rounded-full border border-white/20 object-cover"
            style={{ width: effAvatarPx, height: effAvatarPx }}
          />
          <div className="text-left">
            <div
              className={cn(
                "flex items-center",
                isCompactActivity ? "flex-wrap gap-x-1 gap-y-0.5" : "min-w-0 gap-1.5",
              )}
            >
              <p
                className="font-semibold leading-tight"
                style={{ ...titleFallback, ...titleGlowFallback, fontSize: effNamePx }}
              >
                {safeUser.global_name || safeUser.username}
              </p>
              {showBadges && badges.length > 0 && (
                <div className="flex shrink-0 items-center gap-0.5">
                  {badges.slice(0, 5).map((badge) => (
                    <img
                      key={badge.id}
                      src={`https://cdn.discordapp.com/badge-icons/${badge.icon}.png`}
                      alt={badge.description}
                      title={badge.description}
                      className="shrink-0 rounded-sm object-contain"
                      style={{ width: effBadgePx, height: effBadgePx }}
                    />
                  ))}
                </div>
              )}
            </div>
            <p
              className="leading-tight"
              style={{ ...mutedFallback, ...discordMutedGlow, fontSize: effUserPx }}
            >
              @{safeUser.username}
            </p>
          </div>
        </div>

        {!hasActivity && (
          <a
            href={`https://discord.com/users/${userId}`}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 -translate-y-[15%] font-semibold leading-none transition hover:opacity-100"
            style={{ ...bodyFallback, ...discordBodyGlow, fontSize: profileLinkPx, height: effAvatarPx, opacity: 0.9 }}
          >
            Profile
          </a>
        )}

        {hasActivity && (
          <a
            href={`https://discord.com/users/${userId}`}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "ml-auto flex min-w-0 shrink items-center transition opacity-95 hover:opacity-100",
              isCompactActivity ? "max-w-[36%] gap-0.5" : "gap-3",
            )}
            title="View profile on Discord"
          >
            <div className="min-w-0 flex-1 overflow-hidden text-right">
              <p
                className="truncate font-semibold leading-tight"
                style={{ ...titleFallback, ...titleGlowFallback, fontSize: effActivityTitlePx }}
              >
                {activityTitle}
              </p>
              {showActivitySubtitle && (
                <p
                  className="truncate leading-tight"
                  style={{ ...mutedFallback, ...discordMutedGlow, fontSize: effActivitySubPx }}
                >
                  {activitySubtitle}
                </p>
              )}
              {spotify && spotifyDuration > 0 && (
                <div
                  className="mt-1 ml-auto max-w-full"
                  style={{ width: effProgressW, maxWidth: "100%" }}
                >
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white/80 transition-[width] duration-700 ease-linear"
                      style={{ width: `${spotifyProgress * 100}%` }}
                    />
                  </div>
                  {showProgressTimes && (
                    <div
                      className="mt-1 flex items-center justify-between"
                      style={{
                        ...mutedFallback,
                        ...discordMutedGlow,
                        fontSize: Math.max(8, Math.round(10 * scaleFactor * activityCompactRatio)),
                      }}
                    >
                      <span>{formatMs(Math.min(spotifyElapsed, spotifyDuration))}</span>
                      <span>{formatMs(spotifyDuration)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {activityArt ? (
              <img
                src={activityArt}
                alt={activityTitle}
                className="shrink-0 rounded-md object-cover"
                style={{ width: effActivityArtPx, height: effActivityArtPx }}
              />
            ) : (
              <div
                className="grid shrink-0 place-items-center rounded-md border border-white/15 text-white/70"
                style={{ width: effActivityArtPx, height: effActivityArtPx, fontSize: effActivitySubPx }}
              >
                Active
              </div>
            )}
          </a>
        )}
      </div>
    </>
  );

  if (variant === "outside") {
    return (
      <div className={cn(rootClass, outsideBorderChrome?.className)} style={outsideShellStyle}>
        <div className={contentClass} style={outsideSurfaceStyle}>
          {cardBody}
        </div>
      </div>
    );
  }

  return <div className={rootClass}>{cardBody}</div>;
}
