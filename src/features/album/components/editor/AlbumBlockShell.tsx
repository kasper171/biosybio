import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { ALBUM_SIZE_PRESETS } from "@/features/album/lib/album-grid-utils";
import { useAlbumI18n } from "@/features/album/i18n/album-messages";

type Props = {
  selected?: boolean;
  children: ReactNode;
  onSelect: () => void;
  onRemove: () => void;
  onApplyPreset?: (key: string) => void;
};

export function AlbumBlockShell({
  selected,
  children,
  onSelect,
  onRemove,
  onApplyPreset,
}: Props) {
  const { t } = useAlbumI18n();

  return (
    <div
      className={`album-block album-block--edit ${selected ? "album-block--selected" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      role="button"
      tabIndex={0}
    >
      <div className="album-block__body">{children}</div>

      {selected ? (
        <>
          <div
            className="album-block__sizes"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {Object.entries(ALBUM_SIZE_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                className="album-block__size-btn"
                onClick={() => onApplyPreset?.(key)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="album-block__remove-floating"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label={t("album.editor.remove")}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </>
      ) : null}
    </div>
  );
}
