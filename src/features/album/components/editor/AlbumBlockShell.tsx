import { GripVertical, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import type { AlbumBlock } from "@/features/album/types/album.types";
import { useAlbumI18n } from "@/features/album/i18n/album-messages";

type Props = {
  block: AlbumBlock;
  labelKey: string;
  selected?: boolean;
  children: ReactNode;
  onSelect: () => void;
  onRemove: () => void;
};

export function AlbumBlockShell({ block, labelKey, selected, children, onSelect, onRemove }: Props) {
  const { t } = useAlbumI18n();

  return (
    <div
      className={`album-block album-block--edit ${selected ? "album-block--selected" : ""}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
    >
      <div className="album-block__chrome">
        <button
          type="button"
          className="album-block-drag-handle"
          aria-label={t("album.editor.drag")}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <span className="album-block__label">{t(labelKey)}</span>
        <button
          type="button"
          className="album-block__remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={t("album.editor.remove")}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="album-block__body">{children}</div>
      <span className="sr-only">{block.type}</span>
    </div>
  );
}
