import {
  Image as ImageIcon,
  Film,
  Music2,
  Type,
  MessageCircle,
  Hotel,
  Building2,
} from "lucide-react";
import type { AlbumBlockType } from "@/features/album/types/album.types";
import type { AlbumBlockTypeDefinition } from "@/features/album/types/block-registry.types";
import { ImageBlockEditor, ImageBlockPublic } from "@/features/album/components/blocks/ImageBlock";
import { VideoBlockEditor, VideoBlockPublic } from "@/features/album/components/blocks/VideoBlock";
import { SpotifyBlockEditor, SpotifyBlockPublic } from "@/features/album/components/blocks/SpotifyBlock";
import { TextBlockEditor, TextBlockPublic } from "@/features/album/components/blocks/TextBlock";
import {
  DiscordConnectionBlockEditor,
  DiscordConnectionBlockPublic,
} from "@/features/album/components/blocks/connection/DiscordConnectionBlock";
import {
  HabboConnectionBlockEditor,
  HabboConnectionBlockPublic,
  HabbletConnectionBlockEditor,
  HabbletConnectionBlockPublic,
} from "@/features/album/components/blocks/connection/HotelConnectionBlocks";
import { albumDefaultBlockSize } from "@/features/album/lib/album-grid-utils";

const registry = new Map<AlbumBlockType, AlbumBlockTypeDefinition>();

function register<T extends AlbumBlockType>(def: AlbumBlockTypeDefinition<T>) {
  registry.set(def.type, def as AlbumBlockTypeDefinition);
}

const defaultSize = (type: AlbumBlockType) => albumDefaultBlockSize(type);

register({
  type: "text",
  labelKey: "album.blocks.text",
  icon: Type,
  defaultSize: defaultSize("text"),
  minSize: { w: 2, h: 2 },
  defaultData: () => ({ content: "", textAnimation: "none", align: "left" }),
  Editor: TextBlockEditor,
  Public: TextBlockPublic,
});

register({
  type: "image",
  labelKey: "album.blocks.image",
  icon: ImageIcon,
  defaultSize: defaultSize("image"),
  minSize: { w: 2, h: 2 },
  defaultData: () => ({ url: "", objectFit: "contain" }),
  Editor: ImageBlockEditor,
  Public: ImageBlockPublic,
});

register({
  type: "video",
  labelKey: "album.blocks.video",
  icon: Film,
  defaultSize: defaultSize("video"),
  minSize: { w: 3, h: 3 },
  defaultData: () => ({ url: "", muted: true, loop: false }),
  Editor: VideoBlockEditor,
  Public: VideoBlockPublic,
});

register({
  type: "spotify",
  labelKey: "album.blocks.spotify",
  icon: Music2,
  defaultSize: defaultSize("spotify"),
  minSize: { w: 3, h: 2 },
  defaultData: () => ({ embedUrl: "" }),
  Editor: SpotifyBlockEditor,
  Public: SpotifyBlockPublic,
});

register({
  type: "discord",
  labelKey: "album.blocks.discord",
  icon: MessageCircle,
  defaultSize: defaultSize("discord"),
  minSize: { w: 3, h: 3 },
  defaultData: () => ({ showBadges: true }),
  Editor: DiscordConnectionBlockEditor,
  Public: DiscordConnectionBlockPublic,
});

register({
  type: "habbo",
  labelKey: "album.blocks.habbo",
  icon: Hotel,
  defaultSize: defaultSize("habbo"),
  minSize: { w: 3, h: 3 },
  defaultData: () => ({}),
  Editor: HabboConnectionBlockEditor,
  Public: HabboConnectionBlockPublic,
});

register({
  type: "habblet",
  labelKey: "album.blocks.habblet",
  icon: Building2,
  defaultSize: defaultSize("habblet"),
  minSize: { w: 3, h: 3 },
  defaultData: () => ({}),
  Editor: HabbletConnectionBlockEditor,
  Public: HabbletConnectionBlockPublic,
});

export function getAlbumBlockDef(type: AlbumBlockType): AlbumBlockTypeDefinition | undefined {
  return registry.get(type);
}

export function listAlbumBlockDefs(): AlbumBlockTypeDefinition[] {
  return Array.from(registry.values());
}

export const ALBUM_BLOCK_TYPES = Array.from(registry.keys());
