import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { FaDiscord } from "react-icons/fa";
import type { Profile } from "@/lib/profile-storage";
import {
  buildCardGlowShadow,
  buildCardSolidBorderShadow,
  combineBoxShadows,
} from "@/lib/card-border";
import {
  getDiscordBodyStyle,
  getDiscordMutedStyle,
  getDiscordTitleStyle,
  getIconColorStyle,
  getTextGlowStyle,
  hexToRgba,
} from "@/lib/profile-colors";

type DiscordUser = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
  discriminator?: string;
};

type LanyardActivity = {
  name: string;
  details?: string | null;
  state?: string | null;
  application_id?: string | null;
  assets?: {
    large_image?: string | null;
    large_text?: string | null;
  };
};

type LanyardData = {
  discord_user: DiscordUser;
  activities: LanyardActivity[];
  spotify?: {
    track_id?: string | null;
    timestamps?: {
      start: number;
      end: number;
    };
    song: string;
    artist: string;
    album: string;
    album_art_url: string;
  } | null;
};

type DiscordBadge = {
  id: string;
  description: string;
  icon: string;
};

type DiscordPresenceData = {
  user: DiscordUser;
  badges: DiscordBadge[];
  activities: LanyardActivity[];
  spotify: LanyardData["spotify"] | null;
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

function parseDcdnPayload(payload: any, userId: string): DiscordPresenceData | null {
  const root = payload?.data ?? payload;
  const user =
    root?.user ??
    root?.discord_user ??
    null;

  if (!user?.id) return null;

  const badges = Array.isArray(root?.badges) ? root.badges : [];

  return {
    user: {
      id: user.id ?? userId,
      username: user.username ?? "discord",
      global_name: user.global_name ?? null,
      avatar: user.avatar ?? null,
      discriminator: user.discriminator,
    },
    badges,
    activities: [],
    spotify: null,
  };
}

function parseLanyardPayload(payload: any): Pick<DiscordPresenceData, "activities" | "spotify"> {
  const root = payload?.data ?? payload;
  const activities = Array.isArray(root?.activities) ? root.activities : [];
  const spotify = root?.spotify ?? null;
  return { activities, spotify };
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

    const load = async () => {
      try {
        const [dcdnRes, lanyardRes] = await Promise.allSettled([
          fetch(`https://dcdn.dstn.to/profile/${userId}`, { cache: "no-store" }),
          fetch(`https://api.lanyard.rest/v1/users/${userId}`, { cache: "no-store" }),
        ]);

        const next: DiscordPresenceData = {
          user: { id: userId, username: "discord", global_name: null, avatar: null },
          badges: [],
          activities: [],
          spotify: null,
        };

        if (dcdnRes.status === "fulfilled") {
          const dcdnJson = await dcdnRes.value.json();
          const parsedDcdn = parseDcdnPayload(dcdnJson, userId);
          if (parsedDcdn) {
            next.user = parsedDcdn.user;
            next.badges = parsedDcdn.badges;
          }
        }

        if (lanyardRes.status === "fulfilled") {
          const lanyardJson = await lanyardRes.value.json();
          const parsedLanyard = parseLanyardPayload(lanyardJson);
          next.activities = parsedLanyard.activities;
          next.spotify = parsedLanyard.spotify;
        }

        if (active) {
          setData(next);
          writeCachedPresence(userId, next);
        }
      } catch {
        // ignora erro silenciosamente para não quebrar o card público
      }
    };

    load();
    const timer = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [userId]);

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

  const outsideShellStyle: CSSProperties | undefined =
    variant === "outside" && profileTheme
      ? {
          borderRadius: outsideBr,
          boxShadow: combineBoxShadows(
            buildCardSolidBorderShadow(outsideBw, outsideBc),
            buildCardGlowShadow(
              Boolean(profileTheme.effect_glow),
              profileTheme.effect_glow_color ?? profileTheme.card_border_color,
              profileTheme.effect_glow_size ?? 24,
            ),
          ),
        }
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
      <div className="relative z-[1] flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={getAvatarUrl(safeUser)}
            alt={safeUser.username}
            className="shrink-0 rounded-full border border-white/20 object-cover"
            style={{ width: avatarPx, height: avatarPx }}
          />
          <div className="min-w-0 text-left">
            <div className="flex min-w-0 items-center gap-1.5">
              <p className="truncate font-semibold" style={{ ...titleFallback, ...titleGlowFallback, fontSize: namePx }}>
                {safeUser.global_name || safeUser.username}
              </p>
              {showBadges && badges.length > 0 && (
                <div className="flex shrink-0 items-center gap-1">
                  {badges.slice(0, 5).map((badge) => (
                    <img
                      key={badge.id}
                      src={`https://cdn.discordapp.com/badge-icons/${badge.icon}.png`}
                      alt={badge.description}
                      title={badge.description}
                      className="shrink-0 rounded-sm object-contain"
                      style={{ width: badgePx, height: badgePx }}
                    />
                  ))}
                </div>
              )}
            </div>
            <p className="truncate" style={{ ...mutedFallback, ...discordMutedGlow, fontSize: userPx }}>@{safeUser.username}</p>
          </div>
        </div>

        {!hasActivity && (
          <a
            href={`https://discord.com/users/${userId}`}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 -translate-y-[15%] font-semibold leading-none transition hover:opacity-100"
            style={{ ...bodyFallback, ...discordBodyGlow, fontSize: profileLinkPx, height: avatarPx, opacity: 0.9 }}
          >
            Profile
          </a>
        )}

        {hasActivity && (
          <a
            href={`https://discord.com/users/${userId}`}
            target="_blank"
            rel="noreferrer"
            className="ml-auto flex min-w-0 items-center gap-3 pr-0 transition opacity-95 hover:opacity-100"
            title="Ver perfil no Discord"
          >
            <div className="min-w-0 text-right">
              <p className="truncate font-semibold" style={{ ...titleFallback, ...titleGlowFallback, fontSize: activityTitlePx }}>{activityTitle}</p>
              <p className="truncate" style={{ ...mutedFallback, ...discordMutedGlow, fontSize: activitySubPx }}>{activitySubtitle}</p>
              {spotify && spotifyDuration > 0 && (
                <div className="mt-1.5 w-[170px] max-w-full ml-auto" style={{ width: Math.round(170 * scaleFactor) }}>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white/80 transition-[width] duration-700 ease-linear"
                      style={{ width: `${spotifyProgress * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between" style={{ ...mutedFallback, ...discordMutedGlow, fontSize: Math.round(10 * scaleFactor) }}>
                    <span>{formatMs(Math.min(spotifyElapsed, spotifyDuration))}</span>
                    <span>{formatMs(spotifyDuration)}</span>
                  </div>
                </div>
              )}
            </div>
            {activityArt ? (
              <img
                src={activityArt}
                alt={activityTitle}
                className="shrink-0 rounded-md object-cover"
                style={{ width: activityArtPx, height: activityArtPx }}
              />
            ) : (
              <div
                className="grid shrink-0 place-items-center rounded-md border border-white/15 text-white/70"
                style={{ width: activityArtPx, height: activityArtPx, fontSize: activitySubPx }}
              >
                Ativo
              </div>
            )}
          </a>
        )}
      </div>
    </>
  );

  if (variant === "outside") {
    return (
      <div className={rootClass} style={outsideShellStyle}>
        <div className={contentClass} style={outsideSurfaceStyle}>
          {cardBody}
        </div>
      </div>
    );
  }

  return <div className={rootClass}>{cardBody}</div>;
}
