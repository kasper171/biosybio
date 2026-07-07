import { supabase } from "@/integrations/supabase/client";
import { parseDiscordInviteCode } from "@/lib/discord-invite";
import { getBlockFrameInnerHeight } from "@/lib/block-frame";

/** Tabela nova — ainda não está no types.ts gerado */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type ProfileBlockType = "link" | "button" | "spotify" | "youtube" | "discord_invite";
export type ProfileBlockPlacement = "inside" | "outside";
export type ProfileBlockSize = "sm" | "md" | "lg";

export const MAX_PROFILE_BLOCKS = 5;
export const MAX_SHARE_ROW_BLOCKS = 3;

/** Convite Discord: só grande, retângulo ou quadrado */
export const DISCORD_BLOCK_SIZE: ProfileBlockSize = "lg";
export const DISCORD_BLOCK_SHAPES = ["rectangle", "square"] as const;
export type DiscordBlockShape = (typeof DISCORD_BLOCK_SHAPES)[number];

export function isDiscordBlock(block: ProfileBlock | ProfileBlockType): boolean {
  const type = typeof block === "string" ? block : block.block_type;
  return type === "discord_invite";
}

export function normalizeDiscordBlockShape(shape: unknown): DiscordBlockShape {
  return shape === "square" ? "square" : "rectangle";
}

export function normalizeDiscordBlockConfig(config: ProfileBlockConfig): ProfileBlockConfig {
  return {
    ...config,
    size: DISCORD_BLOCK_SIZE,
    block_shape: normalizeDiscordBlockShape(config.block_shape),
  };
}

export function resolveBlockDisplaySize(
  block: ProfileBlock,
  placement: ProfileBlockPlacement = block.placement,
): ProfileBlockSize {
  if (isDiscordBlock(block)) return DISCORD_BLOCK_SIZE;
  return normalizeBlockSize(block.config.size, placement);
}

export function resolveBlockDisplayShape(block: ProfileBlock): "rectangle" | "square" | "round" {
  if (isDiscordBlock(block)) return normalizeDiscordBlockShape(block.config.block_shape);
  if (block.config.block_shape === "square" || block.config.block_shape === "round") {
    return block.config.block_shape;
  }
  return "rectangle";
}

export type ProfileBlockConfig = {
  spotify_kind?: "track" | "album" | "playlist";
  spotify_id?: string;
  youtube_id?: string;
  /** sm = pequeno, md = médio, lg = grande */
  size?: ProfileBlockSize;
  /** Dividir linha com outros blocos que também têm share_row (máx. 3) */
  share_row?: boolean;
  /** false = só o conteúdo (embed/mídia), sem card do site em volta */
  show_card?: boolean;
  /** Forma fixa do bloco: retângulo, quadrado ou redondo */
  block_shape?: "rectangle" | "square" | "round";
  discord_invite_code?: string;
  discord_guild_id?: string;
  member_count?: number;
  online_count?: number;
};

export type ProfileBlock = {
  id: string;
  profile_id: string;
  block_type: ProfileBlockType;
  placement: ProfileBlockPlacement;
  sort_order: number;
  enabled: boolean;
  title: string;
  subtitle: string;
  url: string;
  image_url: string | null;
  config: ProfileBlockConfig;
  created_at: string;
  updated_at: string;
};

export type ProfileBlockInput = {
  block_type: ProfileBlockType;
  placement: ProfileBlockPlacement;
  title?: string;
  subtitle?: string;
  url?: string;
  image_url?: string | null;
  config?: ProfileBlockConfig;
  enabled?: boolean;
};

export const BLOCK_TYPE_LABELS: Record<ProfileBlockType, string> = {
  link: "Link destacado",
  button: "Botão de ação",
  spotify: "Spotify",
  youtube: "YouTube",
  discord_invite: "Convite Discord",
};

export const BLOCK_PLACEMENT_LABELS: Record<ProfileBlockPlacement, string> = {
  inside: "Dentro do card",
  outside: "Card separado abaixo",
};

export const BLOCK_SIZE_LABELS: Record<ProfileBlockSize, string> = {
  sm: "Pequeno",
  md: "Médio",
  lg: "Grande",
};

export function normalizeBlockSize(
  size: unknown,
  placement: ProfileBlockPlacement = "inside",
): ProfileBlockSize {
  if (size === "sm" || size === "md" || size === "lg") return size;
  return placement === "inside" ? "sm" : "md";
}

export function getSpotifyKind(block: ProfileBlock): "track" | "album" | "playlist" {
  if (block.config.spotify_kind) return block.config.spotify_kind;
  const parsed = block.url ? parseSpotifyUrl(block.url) : null;
  return parsed?.kind ?? "track";
}

/** Altura nativa do iframe Spotify — player compacto (80px) evita texto ilegível em frames pequenos */
export function getSpotifyNativeEmbedHeight(block: ProfileBlock): number {
  const kind = getSpotifyKind(block);
  const frameH = getBlockFrameInnerHeight(block);
  if (kind === "track" || frameH < 280) return 80;
  return 352;
}

export type BlockSizeTokens = {
  pad: string;
  gap: string;
  img: string;
  title: string;
  sub: string;
  btn: string;
  shellPad: string;
};

export function getBlockSizeTokens(size: ProfileBlockSize): BlockSizeTokens {
  const tokens: Record<ProfileBlockSize, BlockSizeTokens> = {
    sm: {
      pad: "p-2",
      gap: "gap-2",
      img: "h-9 w-9",
      title: "text-xs",
      sub: "text-[10px]",
      btn: "px-3 py-1.5 text-xs",
      shellPad: "px-3 py-2",
    },
    md: {
      pad: "p-3",
      gap: "gap-3",
      img: "h-12 w-12",
      title: "text-sm",
      sub: "text-xs",
      btn: "px-4 py-2.5 text-sm",
      shellPad: "px-4 py-3",
    },
    lg: {
      pad: "p-4",
      gap: "gap-4",
      img: "h-16 w-16",
      title: "text-base",
      sub: "text-sm",
      btn: "px-5 py-3 text-base",
      shellPad: "px-5 py-4",
    },
  };
  return tokens[size];
}

export function getYoutubeMaxHeight(block: ProfileBlock): number {
  return getBlockFrameInnerHeight(block);
}

/** YouTube precisa de ~160px+ para embed legível; abaixo disso use thumbnail */
export function youtubeEmbedFitsFrame(block: ProfileBlock): boolean {
  return getBlockFrameInnerHeight(block) >= 160;
}

export function blockShowsCard(block: ProfileBlock): boolean {
  return block.config.show_card !== false;
}

export function blockSharesRow(block: ProfileBlock): boolean {
  return block.config.share_row === true;
}

/** Agrupa blocos com "dividir espaço" consecutivos (máx. 3 por linha) */
export function groupBlocksForLayout(blocks: ProfileBlock[]): ProfileBlock[][] {
  const rows: ProfileBlock[][] = [];
  let buffer: ProfileBlock[] = [];

  const flush = () => {
    if (buffer.length === 0) return;
    rows.push(buffer);
    buffer = [];
  };

  for (const block of blocks) {
    if (blockSharesRow(block)) {
      buffer.push(block);
      if (buffer.length >= MAX_SHARE_ROW_BLOCKS) flush();
    } else {
      flush();
      rows.push([block]);
    }
  }
  flush();
  return rows;
}

function normalizeRow(row: Record<string, unknown>): ProfileBlock {
  const rawConfig = (row.config as ProfileBlockConfig | null) ?? {};
  const placement = (row.placement as ProfileBlockPlacement) ?? "inside";
  const config: ProfileBlockConfig = {
    ...rawConfig,
    size: normalizeBlockSize(rawConfig.size, placement),
    share_row: rawConfig.share_row === true,
    show_card: rawConfig.show_card !== false,
    block_shape:
      rawConfig.block_shape === "square" || rawConfig.block_shape === "round"
        ? rawConfig.block_shape
        : "rectangle",
  };
  return {
    id: String(row.id),
    profile_id: String(row.profile_id),
    block_type: row.block_type as ProfileBlockType,
    placement: (row.placement as ProfileBlockPlacement) ?? "inside",
    sort_order: Number(row.sort_order ?? 0),
    enabled: row.enabled !== false,
    title: String(row.title ?? ""),
    subtitle: String(row.subtitle ?? ""),
    url: String(row.url ?? ""),
    image_url: (row.image_url as string | null) ?? null,
    config,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function fetchProfileBlocks(profileId: string): Promise<ProfileBlock[]> {
  const { data, error } = await db
    .from("profile_blocks")
    .select("*")
    .eq("profile_id", profileId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => normalizeRow(row));
}

export async function createProfileBlock(
  profileId: string,
  input: ProfileBlockInput,
): Promise<ProfileBlock> {
  const { count, error: countErr } = await db
    .from("profile_blocks")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId);
  if (countErr) throw countErr;
  if ((count ?? 0) >= MAX_PROFILE_BLOCKS) {
    throw new Error(`Limite de ${MAX_PROFILE_BLOCKS} blocos atingido`);
  }

  const { data: existing } = await db
    .from("profile_blocks")
    .select("sort_order")
    .eq("profile_id", profileId)
    .eq("placement", input.placement)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = existing?.sort_order != null ? Number(existing.sort_order) + 1 : 0;

  const { data, error } = await db
    .from("profile_blocks")
    .insert({
      profile_id: profileId,
      block_type: input.block_type,
      placement: input.placement,
      sort_order: nextOrder,
      enabled: input.enabled !== false,
      title: input.title ?? "",
      subtitle: input.subtitle ?? "",
      url: input.url ?? "",
      image_url: input.image_url ?? null,
      config: input.config ?? {},
    })
    .select("*")
    .single();
  if (error) throw error;
  return normalizeRow(data as Record<string, unknown>);
}

export async function updateProfileBlock(
  blockId: string,
  patch: Partial<ProfileBlockInput> & { sort_order?: number; enabled?: boolean },
): Promise<ProfileBlock> {
  const payload: Record<string, unknown> = {};
  if (patch.block_type !== undefined) payload.block_type = patch.block_type;
  if (patch.placement !== undefined) payload.placement = patch.placement;
  if (patch.title !== undefined) payload.title = patch.title;
  if (patch.subtitle !== undefined) payload.subtitle = patch.subtitle;
  if (patch.url !== undefined) payload.url = patch.url;
  if (patch.image_url !== undefined) payload.image_url = patch.image_url;
  if (patch.config !== undefined) payload.config = patch.config;
  if (patch.enabled !== undefined) payload.enabled = patch.enabled;
  if (patch.sort_order !== undefined) payload.sort_order = patch.sort_order;

  const { data, error } = await db
    .from("profile_blocks")
    .update(payload)
    .eq("id", blockId)
    .select("*")
    .single();
  if (error) throw error;
  return normalizeRow(data as Record<string, unknown>);
}

export async function deleteProfileBlock(blockId: string): Promise<void> {
  const { error } = await db.from("profile_blocks").delete().eq("id", blockId);
  if (error) throw error;
}

export async function reorderProfileBlocks(
  profileId: string,
  placement: ProfileBlockPlacement,
  orderedIds: string[],
): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .from("profile_blocks")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("profile_id", profileId)
        .eq("placement", placement),
    ),
  );
}

export function splitBlocksByPlacement(blocks: ProfileBlock[]) {
  const enabled = blocks.filter((b) => b.enabled && b.block_type !== "text");
  return {
    inside: enabled.filter((b) => b.placement === "inside"),
    outside: enabled.filter((b) => b.placement === "outside"),
  };
}

export type LinkMetadata = {
  title: string;
  subtitle: string;
  image_url: string | null;
  block_type: ProfileBlockType;
  config: ProfileBlockConfig;
};

const SPOTIFY_KINDS = ["track", "album", "playlist"] as const;
type SpotifyKind = (typeof SPOTIFY_KINDS)[number];

/** URL canônica sem prefixo de locale (intl-pt, etc.) */
export function normalizeSpotifyUrl(url: string): string | null {
  const parsed = parseSpotifyUrl(url);
  if (!parsed) return null;
  return `https://open.spotify.com/${parsed.kind}/${parsed.id}`;
}

function parseSpotifyUrl(url: string): { kind: SpotifyKind; id: string } | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  // spotify:track:ID
  const uriMatch = trimmed.match(/^spotify:(track|album|playlist):([a-zA-Z0-9]+)/i);
  if (uriMatch) {
    return { kind: uriMatch[1].toLowerCase() as SpotifyKind, id: uriMatch[2] };
  }

  try {
    const u = new URL(trimmed);
    if (!u.hostname.includes("spotify.com")) return null;

    // /track/ID, /intl-pt/track/ID, /embed/album/ID
    const match = u.pathname.match(/\/(track|album|playlist)\/([a-zA-Z0-9]+)/i);
    if (!match) return null;

    const kind = match[1].toLowerCase() as SpotifyKind;
    const id = match[2];
    if (!SPOTIFY_KINDS.includes(kind) || !id) return null;
    return { kind, id };
  } catch {
    return null;
  }
}

function parseYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtube-nocookie.com")) {
      if (u.pathname.startsWith("/embed/")) {
        return u.pathname.split("/")[2] ?? null;
      }
      const v = u.searchParams.get("v");
      if (v) return v;
      const shorts = u.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shorts?.[1]) return shorts[1];
    }
    return null;
  } catch {
    return null;
  }
}

export function detectBlockFromUrl(url: string): Partial<LinkMetadata> | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const spotify = parseSpotifyUrl(trimmed);
  if (spotify) {
    return {
      block_type: "spotify",
      config: { spotify_kind: spotify.kind, spotify_id: spotify.id },
      title: "",
      subtitle: "",
      image_url: null,
    };
  }

  const youtubeId = parseYoutubeId(trimmed);
  if (youtubeId) {
    return {
      block_type: "youtube",
      config: { youtube_id: youtubeId },
      title: "",
      subtitle: "",
      image_url: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  }

  const discordCode = parseDiscordInviteCode(trimmed);
  if (discordCode) {
    return {
      block_type: "discord_invite",
      config: { discord_invite_code: discordCode },
      title: "",
      subtitle: "",
      image_url: null,
    };
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return {
      block_type: "link",
      config: {},
      title: "",
      subtitle: "",
      image_url: null,
    };
  }

  return null;
}

/** Normaliza URL + tipo + config antes de salvar no banco */
export function resolveBlockPayload(
  blockType: ProfileBlockType,
  url: string,
  existingConfig?: ProfileBlockConfig,
): { block_type: ProfileBlockType; url: string; config: ProfileBlockConfig } {
  const trimmed = url.trim();
  const detected = trimmed ? detectBlockFromUrl(trimmed) : null;
  const spotifyCanonical = trimmed ? normalizeSpotifyUrl(trimmed) : null;
  const baseConfig: ProfileBlockConfig = { ...(existingConfig ?? {}) };

  if (spotifyCanonical || blockType === "spotify") {
    const meta = detectBlockFromUrl(spotifyCanonical ?? trimmed);
    return {
      block_type: "spotify",
      url: spotifyCanonical ?? trimmed,
      config: { ...baseConfig, ...meta?.config },
    };
  }

  if (detected?.block_type === "youtube" || blockType === "youtube") {
    return {
      block_type: "youtube",
      url: trimmed,
      config: { ...baseConfig, ...detected?.config },
    };
  }

  const discordCode = parseDiscordInviteCode(trimmed);
  if (discordCode || blockType === "discord_invite") {
    const code = discordCode ?? baseConfig.discord_invite_code ?? "";
    return {
      block_type: "discord_invite",
      url: code ? `https://discord.gg/${code}` : trimmed,
      config: { ...baseConfig, discord_invite_code: code || baseConfig.discord_invite_code },
    };
  }

  return {
    block_type: detected?.block_type ?? blockType,
    url: trimmed,
    config: { ...baseConfig, ...detected?.config },
  };
}

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: string }).message);
  }
  return "Erro desconhecido";
}

async function fetchOEmbed(url: string): Promise<{ title?: string; author_name?: string; thumbnail_url?: string } | null> {
  const spotifyCanonical = normalizeSpotifyUrl(url);
  if (spotifyCanonical) {
    try {
      const res = await fetch(
        `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyCanonical)}`,
      );
      if (res.ok) {
        const data = (await res.json()) as {
          title?: string;
          author_name?: string;
          thumbnail_url?: string;
        };
        return data;
      }
    } catch {
      // fallback abaixo
    }
  }

  try {
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    return (await res.json()) as { title?: string; author_name?: string; thumbnail_url?: string };
  } catch {
    return null;
  }
}

export async function fetchLinkMetadata(url: string): Promise<LinkMetadata> {
  const discordCode = parseDiscordInviteCode(url);
  if (discordCode) {
    try {
      const { fetchDiscordInvite, discordInfoToBlockFields } = await import("@/lib/discord-invite");
      const info = await fetchDiscordInvite(url);
      const fields = discordInfoToBlockFields(info);
      return {
        title: fields.title,
        subtitle: fields.subtitle,
        image_url: fields.image_url,
        block_type: "discord_invite",
        config: fields.config,
      };
    } catch {
      return {
        title: "",
        subtitle: "",
        image_url: null,
        block_type: "discord_invite",
        config: { discord_invite_code: discordCode },
      };
    }
  }

  const detected = detectBlockFromUrl(url);
  const spotifyCanonical = normalizeSpotifyUrl(url);
  const base: LinkMetadata = {
    title: "",
    subtitle: "",
    image_url: null,
    block_type: "link",
    config: {},
    ...detected,
  };

  const oembed = await fetchOEmbed(spotifyCanonical ?? url);
  if (oembed?.title && !base.title) base.title = oembed.title;
  if (oembed?.author_name && !base.subtitle) base.subtitle = oembed.author_name;
  if (oembed?.thumbnail_url && !base.image_url) base.image_url = oembed.thumbnail_url;

  if (base.block_type === "youtube" && base.config.youtube_id && !base.image_url) {
    base.image_url = `https://img.youtube.com/vi/${base.config.youtube_id}/hqdefault.jpg`;
  }

  return base;
}

export function getSpotifyEmbedUrl(block: ProfileBlock): string | null {
  const id = block.config.spotify_id;
  const kind = block.config.spotify_kind ?? "track";
  if (!id) {
    const parsed = block.url ? parseSpotifyUrl(block.url) : null;
    if (!parsed) return null;
    return `https://open.spotify.com/embed/${parsed.kind}/${parsed.id}?utm_source=generator&theme=0`;
  }
  return `https://open.spotify.com/embed/${kind}/${id}?utm_source=generator&theme=0`;
}

export function getYoutubeEmbedUrl(block: ProfileBlock): string | null {
  const id = block.config.youtube_id ?? (block.url ? parseYoutubeId(block.url) : null);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}
