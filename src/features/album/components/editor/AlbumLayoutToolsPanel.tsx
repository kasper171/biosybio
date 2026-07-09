import type { AlbumBlock, AlbumBlockType } from "@/features/album/types/album.types";
import { AlbumBlockPalette } from "@/features/album/components/editor/AlbumBlockPalette";
import { getAlbumBlockDef } from "@/features/album/registry/blockRegistry";
import { albumCreateBlockId } from "@/features/album/lib/album-grid-utils";

type Props = {
  blocks: AlbumBlock[];
  onBlocksChange: (blocks: AlbumBlock[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function AlbumLayoutToolsPanel({ blocks, onBlocksChange, selectedId, onSelect }: Props) {
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
    <div className="space-y-3">
      <AlbumBlockPalette onAdd={addBlock} />
      {selectedId ? (
        <p className="text-xs leading-relaxed text-white/40">
          Clique no bloco para selecionar. Arraste para mover. Os tamanhos aparecem no bloco selecionado.
        </p>
      ) : (
        <p className="text-xs leading-relaxed text-white/40">
          Adicione um bloco ou clique em um existente no preview para editar tamanho e posição.
        </p>
      )}
    </div>
  );
}
