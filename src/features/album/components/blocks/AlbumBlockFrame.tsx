import type { CSSProperties, ReactNode } from "react";
import type { Profile } from "@/lib/profile-storage";
import type { AlbumBlock, AlbumBlockChrome } from "@/features/album/types/album.types";
import { buildCardBorderChrome, normalizeCardBorderStyle } from "@/lib/card-border";
import {
  cardGlassClass,
  cardGlassSurfaceLayerStyle,
  cardSurfaceFillStyle,
} from "@/lib/card-glass";
import { normalizeCardRevealEffect } from "@/lib/card-reveal";
import { albumBlockRevealClass } from "@/features/album/lib/effects/album-block-chrome";

type Props = {
  block: AlbumBlock;
  profile?: Profile | null;
  animate?: boolean;
  children: ReactNode;
};

function resolveChrome(block: AlbumBlock, profile?: Profile | null): AlbumBlockChrome & { glassEnabled?: boolean } {
  const c = block.chrome ?? {};
  return {
    borderWidth: c.borderWidth ?? Number(profile?.card_border_width ?? 0),
    borderColor: c.borderColor ?? profile?.card_border_color ?? "#ffffff",
    borderStyle: c.borderStyle ?? profile?.card_border_style ?? "solid",
    borderRadius: c.borderRadius ?? Number(profile?.card_border_radius ?? 12),
    glowEnabled: c.glowEnabled ?? Boolean(profile?.effect_glow),
    glowColor: c.glowColor ?? profile?.effect_glow_color ?? profile?.card_border_color,
    glowSize: c.glowSize ?? profile?.effect_glow_size ?? 24,
    glassEnabled: c.glassEnabled ?? profile?.card_glass_enabled === true,
    revealEffect:
      c.revealEffect === "none"
        ? "none"
        : c.revealEffect ??
          (profile?.card_reveal_effect
            ? normalizeCardRevealEffect(profile.card_reveal_effect)
            : "none"),
  };
}

export function AlbumBlockFrame({ block, profile, animate = true, children }: Props) {
  const chrome = resolveChrome(block, profile);
  const radius = chrome.borderRadius ?? 12;
  const borderStyle = chrome.borderStyle === "none" ? "none" : normalizeCardBorderStyle(chrome.borderStyle);
  const borderWidth = borderStyle === "none" ? 0 : (chrome.borderWidth ?? 0);
  const glass = Boolean(chrome.glassEnabled);

  const borderChrome = buildCardBorderChrome({
    borderWidth,
    borderColor: chrome.borderColor ?? "#ffffff",
    borderRadius: radius,
    borderStyle,
    glowEnabled: chrome.glowEnabled,
    glowColor: chrome.glowColor,
    glowSize: chrome.glowSize,
  });

  const revealClass = albumBlockRevealClass(chrome, animate);

  const surfaceProfile = profile
    ? {
        ...profile,
        card_glass_enabled: glass,
        card_color: profile.card_color ?? "#0a0a0f",
        card_opacity: profile.card_opacity ?? 0.92,
        card_blur: profile.card_blur ?? 8,
      }
    : null;

  const borderOverlayStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: 4,
    pointerEvents: "none",
    borderRadius: radius,
    boxSizing: "border-box",
    ...(borderStyle !== "solid" && borderStyle !== "none" && borderWidth > 0
      ? {
          borderWidth,
          borderStyle,
          borderColor: chrome.borderColor,
        }
      : { boxShadow: borderChrome.style.boxShadow }),
  };

  return (
    <div
      className={`album-block-frame relative h-full w-full overflow-hidden ${borderChrome.className} ${revealClass}`}
      style={{ borderRadius: radius }}
    >
      {glass && surfaceProfile ? (
        <div
          aria-hidden
          className={cardGlassClass(surfaceProfile)}
          style={{
            ...cardGlassSurfaceLayerStyle(radius),
            ...cardSurfaceFillStyle(surfaceProfile, true),
          }}
        />
      ) : surfaceProfile && !glass && (profile?.card_opacity ?? 0) > 0 ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            borderRadius: radius,
            ...cardSurfaceFillStyle({ ...surfaceProfile, card_glass_enabled: false }, false),
          }}
        />
      ) : null}

      <div
        className={`relative z-[1] h-full w-full min-h-0 ${block.type === "text" ? "overflow-visible" : "overflow-hidden"}`}
      >
        {children}
      </div>

      {(borderWidth > 0 || chrome.glowEnabled) && (
        <div aria-hidden style={borderOverlayStyle} />
      )}
    </div>
  );
}
