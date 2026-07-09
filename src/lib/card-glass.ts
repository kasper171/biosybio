import type { CSSProperties } from "react";
import type { Profile } from "@/lib/profile-storage";
import { hexToRgba } from "@/lib/profile-colors";

export type CardGlassProfile = Pick<
  Profile,
  "card_glass_enabled" | "card_color" | "card_opacity" | "card_blur"
>;

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

export function cardGlassClass(
  profile: Pick<Profile, "card_glass_enabled"> | null | undefined,
): string | undefined {
  return isCardGlassEnabled(profile) ? "card-glass" : undefined;
}

/** Layout da camada de superfície absoluta (sem background/blur — vêm da classe ou fill). */
export function cardGlassSurfaceLayerStyle(borderRadius: number): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    borderRadius,
  };
}

/** Preenchimento padrão quando glass está desligado. */
export function cardSurfaceFillStyle(
  profile: CardGlassProfile,
  glassEnabled = isCardGlassEnabled(profile),
): Pick<CSSProperties, "background" | "backdropFilter" | "WebkitBackdropFilter"> {
  if (glassEnabled) return {};

  const blur = Number(profile.card_blur ?? 0);
  return {
    background: hexToRgba(profile.card_color, profile.card_opacity),
    ...(blur > 0
      ? {
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
        }
      : {}),
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
