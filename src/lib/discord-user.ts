import type { DiscordUserProfile } from "@/lib/discord/discord-payload";
import { getDiscordDcdnProfileFn } from "@/lib/discord/discord.functions";

export type { DiscordUserProfile };
function getDefaultAvatar(discriminator?: string): string {
  const idx = Number(discriminator ?? "0") % 5;
  return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
}

export function getDiscordAvatarUrl(user: DiscordUserProfile): string {
  if (!user.avatar) return getDefaultAvatar(user.discriminator);
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
}

export async function fetchDiscordUserProfile(userId: string): Promise<DiscordUserProfile | null> {
  try {
    const profile = await getDiscordDcdnProfileFn({ data: { userId } });
    if (profile?.user) {
      return {
        id: profile.user.id,
        username: profile.user.username,
        global_name: profile.user.global_name ?? null,
        avatar: profile.user.avatar ?? null,
        discriminator: profile.user.discriminator,
      };
    }
  } catch (error) {
    console.warn("[fetchDiscordUserProfile]", userId, error);
  }

  return {
    id: userId,
    username: "discord",
    global_name: null,
    avatar: null,
  };
}
