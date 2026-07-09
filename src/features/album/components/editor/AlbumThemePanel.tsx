import type { AlbumTheme } from "@/features/album/types/album.types";
import { albumSanitizeHexColor } from "@/features/album/lib/security/album-sanitize";
import { useAlbumI18n } from "@/features/album/i18n/album-messages";
import { CARD_BORDER_STYLES } from "@/lib/card-border";

type Props = {
  theme: AlbumTheme;
  onChange: (theme: AlbumTheme) => void;
};

function patchSidebar(theme: AlbumTheme, patch: NonNullable<AlbumTheme["sidebar"]>) {
  return { ...theme, sidebar: { ...(theme.sidebar ?? {}), ...patch } };
}

export function AlbumThemePanel({ theme, onChange }: Props) {
  const { t } = useAlbumI18n();
  const sidebar = theme.sidebar ?? {};

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

  const sidebarColor = (key: keyof NonNullable<AlbumTheme["sidebar"]>, label: string, fallback: string) => (
    <label className="album-theme-field">
      <span>{label}</span>
      <input
        type="color"
        value={(sidebar[key] as string) ?? fallback}
        onChange={(e) => {
          const hex = albumSanitizeHexColor(e.target.value);
          if (hex) onChange(patchSidebar(theme, { [key]: hex }));
        }}
      />
    </label>
  );

  return (
    <div className="album-theme-panel space-y-5">
      <section>
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
      </section>

      <section className="space-y-3 border-t border-white/[0.06] pt-4">
        <h3 className="album-theme-panel__title">{t("album.theme.sidebarTitle")}</h3>
        <p className="text-xs leading-relaxed text-white/40">{t("album.theme.sidebarHint")}</p>

        <label className="album-theme-toggle">
          <input
            type="checkbox"
            checked={sidebar.visible !== false}
            onChange={(e) => onChange(patchSidebar(theme, { visible: e.target.checked }))}
          />
          <span>{t("album.theme.sidebarVisible")}</span>
        </label>

        <label className="album-theme-field">
          <span>{t("album.theme.sidebarLayout")}</span>
          <select
            value={sidebar.layout ?? "centered"}
            onChange={(e) =>
              onChange(
                patchSidebar(theme, { layout: e.target.value as "centered" | "aligned" }),
              )
            }
            className="album-input text-xs"
          >
            <option value="centered">{t("album.theme.sidebarLayoutCentered")}</option>
            <option value="aligned">{t("album.theme.sidebarLayoutAligned")}</option>
          </select>
        </label>

        <label className="album-theme-toggle">
          <input
            type="checkbox"
            checked={sidebar.glassEnabled === true}
            onChange={(e) => onChange(patchSidebar(theme, { glassEnabled: e.target.checked }))}
          />
          <span>{t("album.theme.sidebarGlass")}</span>
        </label>

        <label className="album-theme-toggle">
          <input
            type="checkbox"
            checked={sidebar.showDivider !== false}
            onChange={(e) => onChange(patchSidebar(theme, { showDivider: e.target.checked }))}
          />
          <span>{t("album.theme.sidebarDivider")}</span>
        </label>

        {sidebarColor("cardColor", t("album.theme.sidebarCardColor"), "#0a0a0f")}
        {sidebarColor("borderColor", t("album.theme.sidebarBorderColor"), "#ffffff")}
        {sidebarColor("dividerColor", t("album.theme.sidebarDividerColor"), "#ffffff")}

        <label className="album-theme-field">
          <span>{t("album.theme.sidebarOpacity")}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={sidebar.cardOpacity ?? 0.88}
            onChange={(e) => onChange(patchSidebar(theme, { cardOpacity: Number(e.target.value) }))}
          />
        </label>
        <label className="album-theme-field">
          <span>{t("album.theme.sidebarBlur")}</span>
          <input
            type="range"
            min={0}
            max={40}
            value={sidebar.cardBlur ?? 8}
            onChange={(e) => onChange(patchSidebar(theme, { cardBlur: Number(e.target.value) }))}
          />
        </label>
        <label className="album-theme-field">
          <span>{t("album.theme.sidebarBorderWidth")}</span>
          <input
            type="range"
            min={0}
            max={8}
            value={sidebar.borderWidth ?? 2}
            onChange={(e) => onChange(patchSidebar(theme, { borderWidth: Number(e.target.value) }))}
          />
        </label>
        <label className="album-theme-field">
          <span>{t("album.theme.sidebarRadius")}</span>
          <input
            type="range"
            min={0}
            max={32}
            value={sidebar.borderRadius ?? 16}
            onChange={(e) => onChange(patchSidebar(theme, { borderRadius: Number(e.target.value) }))}
          />
        </label>
        <label className="album-theme-field">
          <span>{t("album.theme.sidebarPadding")}</span>
          <input
            type="range"
            min={0}
            max={32}
            value={sidebar.padding ?? 16}
            onChange={(e) => onChange(patchSidebar(theme, { padding: Number(e.target.value) }))}
          />
        </label>
        <label className="album-theme-field">
          <span>{t("album.theme.sidebarBorderStyle")}</span>
          <select
            value={sidebar.borderStyle ?? "solid"}
            onChange={(e) =>
              onChange(
                patchSidebar(theme, {
                  borderStyle: e.target.value as NonNullable<AlbumTheme["sidebar"]>["borderStyle"],
                }),
              )
            }
            className="album-input text-xs"
          >
            <option value="none">{t("album.theme.sidebarBorderNone")}</option>
            {CARD_BORDER_STYLES.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </label>
      </section>
    </div>
  );
}
