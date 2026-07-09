import { useState } from "react";
import type { AlbumBlock, AlbumBlockType, AlbumConnectionsRow, AlbumTheme } from "@/features/album/types/album.types";
import { AlbumGrid } from "@/features/album/components/editor/AlbumGrid";
import { AlbumBlockPalette } from "@/features/album/components/editor/AlbumBlockPalette";
import { getAlbumBlockDef } from "@/features/album/registry/blockRegistry";
import { albumCreateBlockId, albumDefaultBlockSize } from "@/features/album/lib/album-grid-utils";
import { useAlbumBlockResize } from "@/features/album/hooks/useAlbumBlockResize";
import { useAlbumI18n } from "@/features/album/i18n/album-messages";

type Props = {
  blocks: AlbumBlock[];
  theme: AlbumTheme;
  userId: string;
  connections: AlbumConnectionsRow | null;
  onBlocksChange: (blocks: AlbumBlock[]) => void;
};

export function AlbumEditor({ blocks, theme, userId, connections, onBlocksChange }: Props) {
  const { t } = useAlbumI18n();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { applyPreset, presets } = useAlbumBlockResize(onBlocksChange);

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
    setSelectedId(block.id);
  };

  const selected = blocks.find((b) => b.id === selectedId);

  return (
    <div className="album-editor">
      <aside className="album-editor__sidebar">
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
      </aside>
      <div className="album-editor__canvas">
        <AlbumGrid
          blocks={blocks}
          theme={theme}
          mode="edit"
          userId={userId}
          connections={connections}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onLayoutChange={onBlocksChange}
        />
      </div>
    </div>
  );
}
