import type { AlbumBlock, AlbumBlockType } from "@/features/album/types/album.types";
import type { Layout } from "react-grid-layout/legacy";

export const ALBUM_GRID_COLS = 12;
export const ALBUM_ROW_HEIGHT = 44;
export const ALBUM_GRID_MARGIN: [number, number] = [12, 12];

export const ALBUM_BREAKPOINTS = { lg: 1200, md: 768, sm: 0 };
export const ALBUM_COLS_BY_BREAKPOINT = { lg: 12, md: 6, sm: 1 };

export function albumBlocksToLayout(blocks: AlbumBlock[]): Layout[] {
  return blocks.map((b) => ({
    i: b.id,
    x: b.x,
    y: b.y,
    w: b.w,
    h: b.h,
    minW: 1,
    minH: 1,
  }));
}

export function albumMergeLayoutIntoBlocks(blocks: AlbumBlock[], layout: Layout[]): AlbumBlock[] {
  const byId = new Map(layout.map((l) => [l.i, l]));
  return blocks.map((block) => {
    const item = byId.get(block.id);
    if (!item) return block;
    return { ...block, x: item.x, y: item.y, w: item.w, h: item.h };
  });
}

export function albumCreateBlockId(): string {
  return crypto.randomUUID();
}

export const ALBUM_SIZE_PRESETS: Record<string, { w: number; h: number; label: string }> = {
  "1x1": { w: 2, h: 2, label: "1×1" },
  "2x1": { w: 4, h: 2, label: "2×1" },
  "1x2": { w: 2, h: 4, label: "1×2" },
  "2x2": { w: 4, h: 4, label: "2×2" },
  "3x1": { w: 6, h: 2, label: "3×1" },
  wide: { w: 8, h: 3, label: "Largo" },
};

export function albumDefaultBlockSize(type: AlbumBlockType): { w: number; h: number } {
  switch (type) {
    case "text":
      return { w: 4, h: 2 };
    case "spotify":
      return { w: 4, h: 3 };
    case "discord":
    case "habbo":
    case "habblet":
      return { w: 4, h: 4 };
    case "video":
      return { w: 6, h: 4 };
    case "image":
    default:
      return { w: 3, h: 3 };
  }
}
