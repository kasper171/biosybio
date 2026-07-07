export type DiscordInviteInfo = {
  code: string;
  guildId: string;
  name: string;
  iconUrl: string | null;
  memberCount: number;
  onlineCount: number;
  inviteUrl: string;
};

export function parseDiscordInviteCode(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^[a-zA-Z0-9-]{2,32}$/.test(trimmed) && !trimmed.includes(".")) {
    return trimmed;
  }

  try {
    const u = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    const parts = u.pathname.split("/").filter(Boolean);

    if (host === "discord.gg" && parts[0]) {
      return parts[0].split("?")[0];
    }
    if (
      (host === "discord.com" || host === "discordapp.com") &&
      parts[0] === "invite" &&
      parts[1]
    ) {
      return parts[1].split("?")[0];
    }
  } catch {
    return null;
  }

  return null;
}

export function buildDiscordInviteUrl(code: string): string {
  return `https://discord.gg/${code}`;
}

export function formatDiscordMemberLabel(memberCount: number, onlineCount?: number): string {
  const fmt = (n: number) => n.toLocaleString("pt-BR");
  if (onlineCount != null && onlineCount > 0) {
    return `${fmt(memberCount)} membros · ${fmt(onlineCount)} online`;
  }
  return `${fmt(memberCount)} membros`;
}

export async function fetchDiscordInvite(input: string): Promise<DiscordInviteInfo> {
  const code = parseDiscordInviteCode(input);
  if (!code) throw new Error("Link de convite do Discord inválido");

  const res = await fetch(
    `https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true`,
  );

  if (!res.ok) {
    throw new Error("Convite não encontrado ou expirado");
  }

  const data = (await res.json()) as {
    code?: string;
    approximate_member_count?: number;
    approximate_presence_count?: number;
    guild?: {
      id: string;
      name: string;
      icon: string | null;
    };
  };

  const guild = data.guild;
  if (!guild?.id || !guild.name) {
    throw new Error("Não foi possível obter dados do servidor");
  }

  const iconUrl = guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
    : null;

  return {
    code: data.code ?? code,
    guildId: guild.id,
    name: guild.name,
    iconUrl,
    memberCount: data.approximate_member_count ?? 0,
    onlineCount: data.approximate_presence_count ?? 0,
    inviteUrl: buildDiscordInviteUrl(data.code ?? code),
  };
}

export function discordInfoToBlockFields(info: DiscordInviteInfo) {
  return {
    title: info.name,
    subtitle: formatDiscordMemberLabel(info.memberCount, info.onlineCount),
    url: info.inviteUrl,
    image_url: info.iconUrl,
    config: {
      discord_invite_code: info.code,
      discord_guild_id: info.guildId,
      member_count: info.memberCount,
      online_count: info.onlineCount,
    },
  };
}
