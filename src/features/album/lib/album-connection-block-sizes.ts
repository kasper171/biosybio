import type { AlbumBlockType } from "@/features/album/types/album.types";

/** Tamanhos recomendados em unidades do grid (12 cols, row 44px). */
export const ALBUM_CONNECTION_BLOCK_SIZES: Record<
  Extract<AlbumBlockType, "discord" | "habbo" | "habblet" | "spotify">,
  { w: number; h: number; minW: number; minH: number }
> = {
  discord: { w: 4, h: 3, minW: 3, minH: 2 },
  habbo: { w: 3, h: 4, minW: 3, minH: 3 },
  habblet: { w: 3, h: 4, minW: 3, minH: 3 },
  spotify: { w: 4, h: 3, minW: 3, minH: 2 },
};

export function albumSpotifyBlockSize(compact: boolean) {
  return compact
    ? { w: 4, h: 2, minW: 3, minH: 2 }
    : { w: 4, h: 8, minW: 4, minH: 6 };
}
