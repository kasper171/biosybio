import type { ComponentType, LucideIcon } from "lucide-react";
import type { AlbumBlock, AlbumBlockType } from "@/features/album/types/album.types";

export type AlbumBlockEditorProps<T extends AlbumBlockType> = {
  block: Extract<AlbumBlock, { type: T }>;
  onChange: (data: Extract<AlbumBlock, { type: T }>["data"]) => void;
  readOnly?: boolean;
};

export type AlbumBlockPublicProps<T extends AlbumBlockType> = {
  block: Extract<AlbumBlock, { type: T }>;
  userId: string;
};

export type AlbumBlockSizePreset = {
  label: string;
  w: number;
  h: number;
};

export type AlbumBlockTypeDefinition<T extends AlbumBlockType = AlbumBlockType> = {
  type: T;
  labelKey: string;
  icon: LucideIcon;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  maxSize?: { w: number; h: number };
  sizePresets?: AlbumBlockSizePreset[];
  defaultData: () => Extract<AlbumBlock, { type: T }>["data"];
  Editor: ComponentType<AlbumBlockEditorProps<T>>;
  Public: ComponentType<AlbumBlockPublicProps<T>>;
  validate?: (data: Extract<AlbumBlock, { type: T }>["data"]) => string | null;
};
