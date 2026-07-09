import { useState } from "react";
import type { AlbumBlock, AlbumBlockType, AlbumConnectionsRow, AlbumTheme } from "@/features/album/types/album.types";
import { AlbumBlockPalette } from "@/features/album/components/editor/AlbumBlockPalette";
import { getAlbumBlockDef } from "@/features/album/registry/blockRegistry";
import { albumCreateBlockId } from "@/features/album/lib/album-grid-utils";
import { useAlbumBlockResize } from "@/features/album/hooks/useAlbumBlockResize";
import { useAlbumI18n } from "@/features/album/i18n/album-messages";

type Props = {
  blocks: AlbumBlock[];
  onBlocksChange: (blocks: AlbumBlock[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function AlbumLayoutToolsPanel({ blocks, onBlocksChange, selectedId, onSelect }: Props) {
  const { t } = useAlbumI18n();
  const { applyPreset, presets } = useAlbumBlockResize(onBlocksChange);
  const selected = blocks.find((b) => b.id === selectedId);

  const addBlock = (type: AlbumBlockType) => {
    const def = getAlbumBlockDef(type);
    if (!def) return;
    const size = def.defaultSize;
    const maxY = blocks.reduce((acc, b) => Math.max(acc, b.y + b.h), 0);
    const block: AlbumBlock = {
      id: albumCreateBlockId(),
      type,
      x: 0,
      y: maxY,
      w: size.w,
      h: size.h,
      data: def.defaultData() as AlbumBlock["data"],
    };
    onBlocksChange([...blocks, block]);
    onSelect(block.id);
  };

  return (
    <div className="space-y-4">
      <AlbumBlockPalette onAdd={addBlock} />
      {selected ? (
        <div className="album-editor__presets">
          <p className="album-editor__presets-title">{t("album.editor.size")}</p>
          <div className="album-editor__presets-row">
            {Object.entries(presets).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                className="album-editor__preset-btn"
                onClick={() => applyPreset(selected.id, key)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function useAlbumEditorSelection() {
  return useState<string | null>(null);
}

export type AlbumEditorPreviewProps = {
  blocks: AlbumBlock[];
  theme: AlbumTheme;
  userId: string;
  connections: AlbumConnectionsRow | null;
  onBlocksChange: (blocks: AlbumBlock[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};
