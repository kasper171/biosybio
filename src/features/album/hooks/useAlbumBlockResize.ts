import { useCallback } from "react";
import type { AlbumBlock } from "@/features/album/types/album.types";
import { ALBUM_SIZE_PRESETS } from "@/features/album/lib/album-grid-utils";

export function useAlbumBlockResize(
  setLayout: (next: AlbumBlock[] | ((prev: AlbumBlock[]) => AlbumBlock[])) => void,
) {
  const applyPreset = useCallback(
    (blockId: string, presetKey: string) => {
      const preset = ALBUM_SIZE_PRESETS[presetKey];
      if (!preset) return;
      setLayout((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, w: preset.w, h: preset.h } : b)),
      );
    },
    [setLayout],
  );

  return { applyPreset, presets: ALBUM_SIZE_PRESETS };
}
