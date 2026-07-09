import type { CSSProperties } from "react";
import type { Profile } from "@/lib/profile-storage";
import { hexToRgba } from "@/lib/profile-colors";

export type CardGlassProfile = Pick<
  Profile,
  "card_glass_enabled" | "card_color" | "card_opacity" | "card_blur"
>;

export const CARD_GLASS_BG = "rgba(255, 255, 255, 0.06)";

export function isCardGlassEnabled(
  profile: Pick<Profile, "card_glass_enabled"> | null | undefined,
): boolean {
  return profile?.card_glass_enabled === true;
}

/** Animações/transform em ancestrais impedem backdrop-filter de amostrar o wallpaper. */
export function cardGlassNeedsStableStacking(
  profile: Pick<Profile, "card_glass_enabled"> | null | undefined,
): boolean {
  return isCardGlassEnabled(profile);
}

/** Borda + sombras do vidro (backdrop vai inline — mesmo método do card normal). */
export function cardGlassClass(
  profile: Pick<Profile, "card_glass_enabled"> | null | undefined,
): string | undefined {
  return isCardGlassEnabled(profile) ? "card-glass" : undefined;
}

function cardBlurPx(profile: CardGlassProfile): number {
  return Number(profile.card_blur ?? 0) || 0;
}

/** Mesmo pipeline do card normal: backdrop-filter inline via style (não só CSS). */
function cardBackdropFilters(
  blurPx: number,
  glass: boolean,
): Pick<CSSProperties, "backdropFilter" | "WebkitBackdropFilter"> {
  if (blurPx <= 0) return {};
  const filter = glass ? `blur(${blurPx}px) saturate(180%)` : `blur(${blurPx}px)`;
  return {
    backdropFilter: filter,
    WebkitBackdropFilter: filter,
  };
}

/** Layout da camada de superfície absoluta. */
export function cardGlassSurfaceLayerStyle(borderRadius: number): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    borderRadius,
  };
}

/** Preenchimento da superfície — card normal ou glass (sempre com blur inline). */
export function cardSurfaceFillStyle(
  profile: CardGlassProfile,
  glassEnabled = isCardGlassEnabled(profile),
): Pick<CSSProperties, "background" | "backdropFilter" | "WebkitBackdropFilter"> {
  const blur = cardBlurPx(profile);

  if (glassEnabled) {
    return {
      background: CARD_GLASS_BG,
      ...cardBackdropFilters(blur, true),
    };
  }

  return {
    background: hexToRgba(profile.card_color, profile.card_opacity),
    ...cardBackdropFilters(blur, false),
  };
}

/** Mini-cards (badges, ícones sociais, pills) — mesmo blur inline do slider. */
export function cardGlassChipStyle(profile: CardGlassProfile): CSSProperties {
  if (!isCardGlassEnabled(profile)) return {};
  return {
    background: CARD_GLASS_BG,
    ...cardBackdropFilters(cardBlurPx(profile), true),
  };
}

export function cardGlassSurfaceProps(
  profile: CardGlassProfile,
  borderRadius: number,
): { className: string | undefined; style: CSSProperties } {
  const glass = isCardGlassEnabled(profile);
  return {
    className: glass ? "card-glass" : undefined,
    style: {
      ...cardGlassSurfaceLayerStyle(borderRadius),
      ...cardSurfaceFillStyle(profile, glass),
    },
  };
}

/** `isolation: isolate` em ancestrais também bloqueia o backdrop — omitir com glass ativo. */
export function cardGlassIsolationClass(
  profile: Pick<Profile, "card_glass_enabled"> | null | undefined,
): string {
  return isCardGlassEnabled(profile) ? "" : "isolate";
}
