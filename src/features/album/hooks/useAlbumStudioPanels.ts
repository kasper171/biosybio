import { LayoutGrid, Link2, Palette, type LucideIcon } from "lucide-react";
import { useAlbumI18n } from "@/features/album/i18n/album-messages";

export type AlbumStudioPanelKey = "album-layout" | "album-theme" | "album-connections";

const ALBUM_STUDIO_PANEL_DEFS: { key: AlbumStudioPanelKey; icon: LucideIcon }[] = [
  { key: "album-layout", icon: LayoutGrid },
  { key: "album-theme", icon: Palette },
  { key: "album-connections", icon: Link2 },
];

export function useAlbumStudioPanels() {
  const { t } = useAlbumI18n();
  return ALBUM_STUDIO_PANEL_DEFS.map((panel) => ({
    ...panel,
    label: t(`album.studio.panels.${panel.key}`),
  }));
}

export function isAlbumStudioPanelKey(value: unknown): value is AlbumStudioPanelKey {
  return value === "album-layout" || value === "album-theme" || value === "album-connections";
}
