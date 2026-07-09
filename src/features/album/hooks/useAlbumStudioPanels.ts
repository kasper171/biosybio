import { LayoutGrid, Link2, Palette, Image as ImageIcon, Music2, Frame, Sparkles, Layers, User, type LucideIcon } from "lucide-react";
import { useI18n } from "@/i18n/LocaleProvider";
import { useAlbumI18n } from "@/features/album/i18n/album-messages";
import type { PersonalizePanelKey } from "@/components/dashboard/DashboardAccountLayout";

export type AlbumStudioPanelKey =
  | "album-layout"
  | "album-theme"
  | "album-connections"
  | PersonalizePanelKey;

const ALBUM_STUDIO_PANEL_DEFS: { key: AlbumStudioPanelKey; icon: LucideIcon }[] = [
  { key: "album-layout", icon: LayoutGrid },
  { key: "album-theme", icon: Palette },
  { key: "perfil", icon: User },
  { key: "midia", icon: ImageIcon },
  { key: "audio", icon: Music2 },
  { key: "molduras", icon: Frame },
  { key: "efeitos", icon: Sparkles },
  { key: "overlays", icon: Layers },
  { key: "album-connections", icon: Link2 },
];

const ALBUM_ONLY_PANELS = new Set<string>(["album-layout", "album-theme", "album-connections"]);

export function useAlbumStudioPanels() {
  const { t } = useAlbumI18n();
  const { t: dashT } = useI18n();
  return ALBUM_STUDIO_PANEL_DEFS.map((panel) => ({
    ...panel,
    label: ALBUM_ONLY_PANELS.has(panel.key)
      ? t(`album.studio.panels.${panel.key}` as "album.studio.panels.album-layout")
      : dashT(`dashboard.layout.panels.${panel.key}` as "dashboard.layout.panels.perfil"),
  }));
}

export function isAlbumStudioPanelKey(value: unknown): value is AlbumStudioPanelKey {
  return ALBUM_STUDIO_PANEL_DEFS.some((p) => p.key === value);
}
