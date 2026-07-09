import type { AlbumBlockType } from "@/features/album/types/album.types";
import { listAlbumBlockDefs } from "@/features/album/registry/blockRegistry";
import { useAlbumI18n } from "@/features/album/i18n/album-messages";

type Props = {
  onAdd: (type: AlbumBlockType) => void;
};

export function AlbumBlockPalette({ onAdd }: Props) {
  const { t } = useAlbumI18n();
  const defs = listAlbumBlockDefs();

  return (
    <div className="album-palette">
      <p className="album-palette__title">{t("album.editor.addBlock")}</p>
      <div className="album-palette__grid">
        {defs.map((def) => {
          const Icon = def.icon;
          return (
            <button
              key={def.type}
              type="button"
              className="album-palette__item"
              onClick={() => onAdd(def.type)}
            >
              <Icon className="h-4 w-4 text-[oklch(0.65_0.28_0)]" />
              <span>{t(def.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
