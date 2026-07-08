export type DiscordUser = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
  discriminator?: string;
};

export type DiscordUserProfile = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  discriminator?: string;
};

export type LanyardActivity = {
  name: string;
  details?: string | null;
  state?: string | null;
  application_id?: string | null;
  assets?: {
    large_image?: string | null;
    large_text?: string | null;
  };
};

export type LanyardSpotify = {
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

export type DiscordBadge = {
  id: string;
  description: string;
  icon: string;
};

export type DiscordDcdnProfile = {
  user: DiscordUser;
  badges: DiscordBadge[];
};

export type DiscordPresenceSlice = {
  activities: LanyardActivity[];
  spotify: LanyardSpotify;
};

export function parseDcdnPayload(payload: unknown, userId: string): DiscordDcdnProfile | null {
  const root = (payload as { data?: unknown })?.data ?? payload;
  const obj = root as {
    user?: Record<string, unknown>;
    discord_user?: Record<string, unknown>;
    badges?: DiscordBadge[];
  };
  const user = obj?.user ?? obj?.discord_user;
  if (!user?.id) return null;

  return {
    user: {
      id: String(user.id ?? userId),
      username: String(user.username ?? "discord"),
      global_name: (user.global_name as string | null) ?? null,
      avatar: (user.avatar as string | null) ?? null,
      discriminator: user.discriminator != null ? String(user.discriminator) : undefined,
    },
    badges: Array.isArray(obj?.badges) ? obj.badges : [],
  };
}

export function parseLanyardPresencePayload(payload: unknown): DiscordPresenceSlice {
  const root = (payload as { data?: unknown })?.data ?? payload;
  const obj = root as {
    activities?: LanyardActivity[];
    spotify?: LanyardSpotify;
  };
  return {
    activities: Array.isArray(obj?.activities) ? obj.activities : [],
    spotify: obj?.spotify ?? null,
  };
}

export function parseLanyardPresenceEvent(data: unknown): DiscordPresenceSlice {
  return parseLanyardPresencePayload({ data });
}
