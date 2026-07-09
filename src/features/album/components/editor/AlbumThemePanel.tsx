import type { AlbumTheme } from "@/features/album/types/album.types";
import { albumSanitizeHexColor } from "@/features/album/lib/security/album-sanitize";
import { useAlbumI18n } from "@/features/album/i18n/album-messages";

type Props = {
  theme: AlbumTheme;
  onChange: (theme: AlbumTheme) => void;
};

export function AlbumThemePanel({ theme, onChange }: Props) {
  const { t } = useAlbumI18n();

  const colorField = (key: keyof AlbumTheme, label: string) => (
    <label className="album-theme-field">
      <span>{label}</span>
      <input
        type="color"
        value={(theme[key] as string) ?? "#ffffff"}
        onChange={(e) => {
          const hex = albumSanitizeHexColor(e.target.value);
          if (hex) onChange({ ...theme, [key]: hex });
        }}
      />
    </label>
  );

  return (
    <div className="album-theme-panel">
      <h3 className="album-theme-panel__title">{t("album.theme.title")}</h3>
      <div className="album-theme-panel__grid">
        {colorField("backgroundColor", t("album.theme.background"))}
        {colorField("bodyTextColor", t("album.theme.body"))}
        {colorField("titleTextColor", t("album.theme.titleColor"))}
        {colorField("glowColor", t("album.theme.glow"))}
      </div>
      <label className="album-theme-toggle">
        <input
          type="checkbox"
          checked={theme.glowEnabled ?? false}
          onChange={(e) => onChange({ ...theme, glowEnabled: e.target.checked })}
        />
        <span>{t("album.theme.glowEnabled")}</span>
      </label>
      <label className="album-theme-field">
        <span>{t("album.theme.glowSize")}</span>
        <input
          type="range"
          min={0}
          max={24}
          value={theme.glowSize ?? 8}
          onChange={(e) => onChange({ ...theme, glowSize: Number(e.target.value) })}
        />
      </label>
    </div>
  );
}
