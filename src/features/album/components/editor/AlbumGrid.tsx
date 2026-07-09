import { useMemo } from "react";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout/legacy";
import type { Profile } from "@/lib/profile-storage";
import type { AlbumBlock, AlbumBlockType, AlbumConnectionsRow, AlbumTheme } from "@/features/album/types/album.types";
import { getAlbumBlockDef } from "@/features/album/registry/blockRegistry";
import {
  ALBUM_BREAKPOINTS,
  ALBUM_COLS_BY_BREAKPOINT,
  ALBUM_GRID_MARGIN,
  ALBUM_ROW_HEIGHT,
  albumBlocksToLayout,
  albumMergeLayoutIntoBlocks,
} from "@/features/album/lib/album-grid-utils";
import { AlbumBlockShell } from "@/features/album/components/editor/AlbumBlockShell";
import { AlbumBlockFrame } from "@/features/album/components/blocks/AlbumBlockFrame";
import { releaseAlbumBlockMedia } from "@/features/album/lib/album-block-media";
import { useAlbumBlockResize } from "@/features/album/hooks/useAlbumBlockResize";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGrid = WidthProvider(Responsive);

const PREVIEW_IN_EDIT: AlbumBlockType[] = ["discord", "habbo", "habblet", "spotify"];

type Props = {
  blocks: AlbumBlock[];
  theme: AlbumTheme;
  mode: "edit" | "public";
  profile?: Profile | null;
  userId?: string;
  connections?: AlbumConnectionsRow | null;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onLayoutChange?: (blocks: AlbumBlock[]) => void;
};

function renderPublicBlock(
  block: AlbumBlock,
  def: NonNullable<ReturnType<typeof getAlbumBlockDef>>,
  opts: {
    userId: string;
    theme: AlbumTheme;
    connections: AlbumConnectionsRow | null;
    profile: Profile | null | undefined;
  },
) {
  const Public = def.Public;
  if (block.type === "text") {
    return <Public block={block as never} userId={opts.userId} theme={opts.theme} />;
  }
  if (block.type === "discord" || block.type === "habbo" || block.type === "habblet") {
    return (
      <Public
        block={block as never}
        userId={opts.userId}
        connections={opts.connections}
        profile={opts.profile}
      />
    );
  }
  return <Public block={block as never} userId={opts.userId} />;
}

export function AlbumGrid({
  blocks,
  theme,
  mode,
  profile,
  userId,
  connections = null,
  selectedId,
  onSelect,
  onLayoutChange,
}: Props) {
  const { applyPreset } = useAlbumBlockResize(onLayoutChange ?? (() => {}));

  const layouts = useMemo(() => {
    const lg = albumBlocksToLayout(blocks);
    return { lg, md: lg, sm: lg.map((item) => ({ ...item, x: 0, w: 1 })) };
  }, [blocks]);

  const isEdit = mode === "edit";

  if (blocks.length === 0) {
    return (
      <div className="album-empty-state">
        <div className="album-empty-state__glow" aria-hidden />
        <p className="album-empty-state__title">Seu álbum está vazio</p>
        <p className="album-empty-state__desc">
          Adicione blocos na paleta ou clique em um tipo para começar a montar seu layout.
        </p>
      </div>
    );
  }

  return (
    <div className={`album-grid-wrap ${isEdit ? "album-grid-wrap--edit" : "album-grid-wrap--public"}`}>
      <ResponsiveGrid
        className="album-grid"
        layouts={layouts}
        breakpoints={ALBUM_BREAKPOINTS}
        cols={ALBUM_COLS_BY_BREAKPOINT}
        rowHeight={ALBUM_ROW_HEIGHT}
        margin={ALBUM_GRID_MARGIN}
        containerPadding={[0, 0]}
        isDraggable={isEdit}
        isResizable={isEdit}
        compactType="vertical"
        preventCollision={false}
        onLayoutChange={(_current: Layout[], allLayouts) => {
          if (!isEdit || !onLayoutChange) return;
          const lg = allLayouts.lg ?? _current;
          onLayoutChange(albumMergeLayoutIntoBlocks(blocks, lg));
        }}
      >
        {blocks.map((block) => {
          const def = getAlbumBlockDef(block.type);
          if (!def) return null;

          const isSelected = selectedId === block.id;
          const usePreviewInEdit = isEdit && PREVIEW_IN_EDIT.includes(block.type);

          const blockContent = (() => {
            if (mode === "public" || usePreviewInEdit) {
              return renderPublicBlock(block, def, {
                userId: userId ?? "",
                theme,
                connections,
                profile,
              });
            }
            const Editor = def.Editor;
            return (
              <Editor
                block={block as never}
                userId={userId ?? ""}
                theme={theme}
                onChange={(data) => {
                  onLayoutChange?.(
                    blocks.map((b) => (b.id === block.id ? { ...b, data } : b)),
                  );
                }}
              />
            );
          })();

          const framed = (
            <AlbumBlockFrame block={block} profile={profile} animate={mode === "public"}>
              {blockContent}
            </AlbumBlockFrame>
          );

          if (mode === "public") {
            return (
              <div key={block.id} className="album-block album-block--public">
                {framed}
              </div>
            );
          }

          return (
            <div key={block.id}>
              <AlbumBlockShell
                selected={isSelected}
                onSelect={() => onSelect?.(block.id)}
                onRemove={() => {
                  void releaseAlbumBlockMedia(block);
                  onLayoutChange?.(blocks.filter((b) => b.id !== block.id));
                  if (isSelected) onSelect?.(null);
                }}
                onApplyPreset={(key) => applyPreset(block.id, key)}
              >
                {framed}
              </AlbumBlockShell>
            </div>
          );
        })}
      </ResponsiveGrid>
    </div>
  );
}
