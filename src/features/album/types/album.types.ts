export type ProfileDisplayStyle = "card" | "album";

import type { CardBorderStyle } from "@/lib/card-border";
import type { CardRevealEffect } from "@/lib/card-reveal";

export type AlbumBlockType =
  | "image"
  | "video"
  | "spotify"
  | "text"
  | "discord"
  | "habbo"
  | "habblet";

export type AlbumGridItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
};

export type AlbumBlockChrome = {
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: CardBorderStyle | "none";
  borderRadius?: number;
  glowEnabled?: boolean;
  glowColor?: string;
  glowSize?: number;
  glassEnabled?: boolean;
  revealEffect?: CardRevealEffect | "none";
};

export type AlbumBlockBase = {
  id: string;
  type: AlbumBlockType;
  x: number;
  y: number;
  w: number;
  h: number;
  chrome?: AlbumBlockChrome;
};

export type AlbumImageBlockData = {
  url: string;
  storagePath?: string;
  bytes?: number;
  alt?: string;
  objectFit?: "cover" | "contain";
  posX?: number;
  posY?: number;
};

export type AlbumVideoBlockData = {
  url: string;
  storagePath?: string;
  bytes?: number;
  posterUrl?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  posX?: number;
  posY?: number;
};

export type AlbumSpotifyBlockData = {
  embedUrl: string;
  title?: string;
  kind?: "track" | "album" | "playlist" | "episode" | "show";
};

export type AlbumTextBlockData = {
  content: string;
  textAnimation?: string;
  fontFamily?: string;
  color?: string;
  align?: "left" | "center" | "right";
};

export type AlbumConnectionBlockData = {
  showBadges?: boolean;
  scale?: number;
};

export type AlbumBlockDataMap = {
  image: AlbumImageBlockData;
  video: AlbumVideoBlockData;
  spotify: AlbumSpotifyBlockData;
  text: AlbumTextBlockData;
  discord: AlbumConnectionBlockData;
  habbo: AlbumConnectionBlockData;
  habblet: AlbumConnectionBlockData;
};

export type AlbumBlock<T extends AlbumBlockType = AlbumBlockType> = AlbumBlockBase & {
  type: T;
  data: AlbumBlockDataMap[T];
};

export type AlbumTheme = {
  pageFontFamily?: string;
  backgroundColor?: string;
  backgroundUrl?: string;
  backgroundBlur?: number;
  backgroundBrightness?: number;
  titleTextColor?: string;
  bodyTextColor?: string;
  mutedTextColor?: string;
  glowEnabled?: boolean;
  glowColor?: string;
  glowSize?: number;
  sidebar?: AlbumSidebarTheme;
};

export type AlbumSidebarTheme = {
  /** Oculta a coluna esquerda inteira */
  visible?: boolean;
  layout?: "centered" | "aligned";
  glassEnabled?: boolean;
  cardColor?: string;
  cardOpacity?: number;
  cardBlur?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: CardBorderStyle | "none";
  borderRadius?: number;
  showDivider?: boolean;
  dividerColor?: string;
  padding?: number;
  /** Conexões (Discord/Habbo/Habblet) abaixo do perfil na coluna esquerda */
  showSidebarConnections?: boolean;
  /** Glass / fundo nos cards de conexão (Discord, Habbo, Habblet) na coluna esquerda */
  connectionsGlassEnabled?: boolean;
};

export type AlbumLayoutRow = {
  id: string;
  user_id: string;
  layout: AlbumBlock[];
  theme: AlbumTheme;
  storage_bytes_used: number;
  updated_at: string;
};

export type AlbumConnectionsRow = {
  user_id: string;
  discord_user_id: string | null;
  discord_show_badges: boolean;
  discord_inside_scale: number | null;
  habbo_username: string | null;
  habbo_domain: string | null;
  habbo_figure: string | null;
  habbo_motto: string | null;
  habbo_level: number | null;
  habbo_synced_at: string | null;
  habblet_username: string | null;
  habblet_figure: string | null;
  habblet_motto: string | null;
  habblet_achievement_points: number | null;
  habblet_synced_at: string | null;
};

export type AlbumPublicProfileMeta = {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  showUsername: boolean;
  showViewCount: boolean;
  viewCount: number;
};
