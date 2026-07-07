export type DiscordUserProfile = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  discriminator?: string;
};

function getDefaultAvatar(discriminator?: string): string {
  const idx = Number(discriminator ?? "0") % 5;
  return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
}

export function getDiscordAvatarUrl(user: DiscordUserProfile): string {
  if (!user.avatar) return getDefaultAvatar(user.discriminator);
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
}

function parseDcdnUser(payload: unknown, userId: string): DiscordUserProfile | null {
  const root = (payload as { data?: unknown })?.data ?? payload;
  const obj = root as {
    user?: Record<string, unknown>;
    discord_user?: Record<string, unknown>;
  };
  const user = obj?.user ?? obj?.discord_user;
  if (!user?.id) return null;

  return {
    id: String(user.id ?? userId),
    username: String(user.username ?? "discord"),
    global_name: (user.global_name as string | null) ?? null,
    avatar: (user.avatar as string | null) ?? null,
    discriminator: user.discriminator != null ? String(user.discriminator) : undefined,
  };
}

function parseLanyardUser(payload: unknown, userId: string): DiscordUserProfile | null {
  const root = (payload as { data?: { discord_user?: Record<string, unknown> } })?.data;
  const user = root?.discord_user;
  if (!user?.id) return null;

  return {
    id: String(user.id ?? userId),
    username: String(user.username ?? "discord"),
    global_name: (user.global_name as string | null) ?? null,
    avatar: (user.avatar as string | null) ?? null,
    discriminator: user.discriminator != null ? String(user.discriminator) : undefined,
  };
}

export async function fetchDiscordUserProfile(userId: string): Promise<DiscordUserProfile | null> {
  try {
    const [dcdnRes, lanyardRes] = await Promise.allSettled([
      fetch(`https://dcdn.dstn.to/profile/${userId}`, { cache: "no-store" }),
      fetch(`https://api.lanyard.rest/v1/users/${userId}`, { cache: "no-store" }),
    ]);

    if (dcdnRes.status === "fulfilled" && dcdnRes.value.ok) {
      const json = await dcdnRes.value.json();
      const parsed = parseDcdnUser(json, userId);
      if (parsed) return parsed;
    }

    if (lanyardRes.status === "fulfilled" && lanyardRes.value.ok) {
      const json = await lanyardRes.value.json();
      const parsed = parseLanyardUser(json, userId);
      if (parsed) return parsed;
    }
  } catch {
    // fallback abaixo
  }

  return {
    id: userId,
    username: "discord",
    global_name: null,
    avatar: null,
  };
}
