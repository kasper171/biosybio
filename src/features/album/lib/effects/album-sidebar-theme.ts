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
  cardOpacity: 0,
  cardBlur: 0,
  borderWidth: 0,
  borderColor: "rgba(255,255,255,0.14)",
  borderStyle: "solid",
  borderRadius: 16,
  showDivider: true,
  dividerColor: "rgba(255,255,255,0.12)",
  padding: 16,
  showSidebarConnections: true,
  connectionsGlassEnabled: false,
};

export function resolveAlbumSidebarTheme(theme: AlbumTheme, _profile?: Profile | null): ResolvedAlbumSidebar {
  const s = theme.sidebar ?? {};
  const glassEnabled = s.glassEnabled === true;
  const connectionsGlassEnabled = s.connectionsGlassEnabled === true;

  return {
    visible: s.visible !== false,
    layout: s.layout === "aligned" ? "aligned" : "centered",
    glassEnabled,
    cardColor: s.cardColor ?? DEFAULTS.cardColor,
    cardOpacity: s.cardOpacity ?? (glassEnabled ? 0.88 : 0),
    cardBlur: s.cardBlur ?? (glassEnabled ? 8 : 0),
    borderWidth: s.borderWidth ?? DEFAULTS.borderWidth,
    borderColor: s.borderColor ?? DEFAULTS.borderColor,
    borderStyle:
      s.borderStyle === "none"
        ? "none"
        : normalizeCardBorderStyle(s.borderStyle ?? DEFAULTS.borderStyle),
    borderRadius: s.borderRadius ?? DEFAULTS.borderRadius,
    showDivider: s.showDivider !== false,
    dividerColor: s.dividerColor ?? DEFAULTS.dividerColor,
    padding: s.padding ?? DEFAULTS.padding,
    showSidebarConnections: s.showSidebarConnections !== false,
    connectionsGlassEnabled,
  };
}

export function albumSidebarShouldShowSurface(sidebar: ResolvedAlbumSidebar): boolean {
  return sidebar.glassEnabled || sidebar.cardOpacity > 0;
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

/** Perfil derivado para Discord/Habbo/Habblet na coluna esquerda — sem herdar glass do Card Normal. */
export function albumSidebarConnectionsProfile(
  profile: Profile,
  sidebar: ResolvedAlbumSidebar,
): Profile {
  if (!sidebar.connectionsGlassEnabled) {
    return {
      ...profile,
      card_glass_enabled: false,
      card_opacity: 0,
      card_blur: 0,
      card_border_width: 0,
      effect_glow: false,
    };
  }

  return {
    ...profile,
    card_glass_enabled: true,
    card_color: sidebar.cardColor,
    card_opacity: sidebar.cardOpacity > 0 ? sidebar.cardOpacity : 0.88,
    card_blur: sidebar.cardBlur > 0 ? sidebar.cardBlur : 8,
    card_border_width: sidebar.borderWidth,
    card_border_color: sidebar.borderColor,
    card_border_radius: sidebar.borderRadius,
    card_border_style: sidebar.borderStyle === "none" ? "solid" : sidebar.borderStyle,
    effect_glow: false,
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
): { className?: string; style: CSSProperties } | null {
  if (!albumSidebarShouldShowSurface(sidebar)) return null;

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
