import type { CSSProperties } from "react";
import type { Profile } from "@/lib/profile-storage";
import type { AlbumSidebarTheme, AlbumTheme } from "@/features/album/types/album.types";
import { buildCardBorderChrome, normalizeCardBorderStyle } from "@/lib/card-border";
import {
  cardGlassClass,
  cardGlassSurfaceLayerStyle,
  cardSurfaceFillStyle,
  isCardGlassEnabled,
} from "@/lib/card-glass";
import { albumGetTextGlowStyle } from "@/features/album/lib/effects/album-profile-colors";

export type ResolvedAlbumSidebar = Required<
  Omit<AlbumSidebarTheme, "layout" | "borderStyle">
> & {
  layout: "centered" | "aligned";
  borderStyle: ReturnType<typeof normalizeCardBorderStyle> | "none";
};

const DEFAULTS: ResolvedAlbumSidebar = {
  visible: true,
  layout: "centered",
  glassEnabled: false,
  cardColor: "#0a0a0f",
  cardOpacity: 0.88,
  cardBlur: 8,
  borderWidth: 2,
  borderColor: "rgba(255,255,255,0.14)",
  borderStyle: "solid",
  borderRadius: 16,
  showDivider: true,
  dividerColor: "rgba(255,255,255,0.12)",
  padding: 16,
  showSidebarConnections: true,
};

export function resolveAlbumSidebarTheme(theme: AlbumTheme, profile?: Profile | null): ResolvedAlbumSidebar {
  const s = theme.sidebar ?? {};
  return {
    visible: s.visible !== false,
    layout: s.layout === "aligned" ? "aligned" : "centered",
    glassEnabled: s.glassEnabled ?? Boolean(profile?.card_glass_enabled),
    cardColor: s.cardColor ?? profile?.card_color ?? DEFAULTS.cardColor,
    cardOpacity: s.cardOpacity ?? profile?.card_opacity ?? DEFAULTS.cardOpacity,
    cardBlur: s.cardBlur ?? profile?.card_blur ?? DEFAULTS.cardBlur,
    borderWidth: s.borderWidth ?? Number(profile?.card_border_width ?? DEFAULTS.borderWidth),
    borderColor: s.borderColor ?? profile?.card_border_color ?? DEFAULTS.borderColor,
    borderStyle:
      s.borderStyle === "none"
        ? "none"
        : normalizeCardBorderStyle(s.borderStyle ?? profile?.card_border_style ?? DEFAULTS.borderStyle),
    borderRadius: s.borderRadius ?? Number(profile?.card_border_radius ?? DEFAULTS.borderRadius),
    showDivider: s.showDivider !== false,
  dividerColor: s.dividerColor ?? profile?.card_border_color ?? DEFAULTS.dividerColor,
  padding: s.padding ?? DEFAULTS.padding,
  showSidebarConnections: s.showSidebarConnections !== false,
};
}

export function albumSidebarSurfaceProfile(
  sidebar: ResolvedAlbumSidebar,
): Pick<Profile, "card_glass_enabled" | "card_color" | "card_opacity" | "card_blur"> {
  return {
    card_glass_enabled: sidebar.glassEnabled,
    card_color: sidebar.cardColor,
    card_opacity: sidebar.cardOpacity,
    card_blur: sidebar.cardBlur,
  };
}

export function albumSidebarCardChrome(sidebar: ResolvedAlbumSidebar) {
  const borderWidth = sidebar.borderStyle === "none" ? 0 : sidebar.borderWidth;
  return buildCardBorderChrome({
    borderWidth,
    borderColor: sidebar.borderColor,
    borderRadius: sidebar.borderRadius,
    borderStyle: sidebar.borderStyle === "none" ? "solid" : sidebar.borderStyle,
    glowEnabled: false,
  });
}

export function albumSidebarCardStyles(
  theme: AlbumTheme,
  profile?: Profile | null,
): { shell: CSSProperties; className: string; surfaceRadius: number; sidebar: ResolvedAlbumSidebar } {
  const sidebar = resolveAlbumSidebarTheme(theme, profile);
  const surfaceProfile = albumSidebarSurfaceProfile(sidebar);
  const glass = isCardGlassEnabled(surfaceProfile);
  const chrome = albumSidebarCardChrome(sidebar);

  return {
    sidebar,
    surfaceRadius: sidebar.borderRadius,
    className: chrome.className,
    shell: {
      ...chrome.style,
      borderRadius: sidebar.borderRadius,
      padding: sidebar.padding,
      boxSizing: "border-box",
    },
  };
}

export function albumSidebarSurfaceLayerStyle(
  sidebar: ResolvedAlbumSidebar,
): { className?: string; style: CSSProperties } {
  const surfaceProfile = albumSidebarSurfaceProfile(sidebar);
  const glass = isCardGlassEnabled(surfaceProfile);
  return {
    className: cardGlassClass(surfaceProfile),
    style: {
      ...cardGlassSurfaceLayerStyle(sidebar.borderRadius),
      ...cardSurfaceFillStyle(surfaceProfile, glass),
    },
  };
}

export function albumSidebarTitleGlow(theme: AlbumTheme): CSSProperties | undefined {
  return albumGetTextGlowStyle(theme);
}
