import type { CSSProperties, ReactNode } from "react";
import type { Profile } from "@/lib/profile-storage";
import type { AlbumBlock, AlbumBlockChrome } from "@/features/album/types/album.types";
import { buildCardBorderChrome } from "@/lib/card-border";
import {
  cardGlassClass,
  cardGlassIsolationClass,
  cardGlassSurfaceLayerStyle,
  cardSurfaceFillStyle,
  isCardGlassEnabled,
} from "@/lib/card-glass";
import { normalizeCardRevealEffect } from "@/lib/card-reveal";
import { albumBlockRevealClass } from "@/features/album/lib/effects/album-block-chrome";

type Props = {
  block: AlbumBlock;
  profile?: Profile | null;
  animate?: boolean;
  children: ReactNode;
};

function resolveChrome(block: AlbumBlock, profile?: Profile | null): AlbumBlockChrome {
  const c = block.chrome ?? {};
  return {
    borderWidth: c.borderWidth ?? Number(profile?.card_border_width ?? 0),
    borderColor: c.borderColor ?? profile?.card_border_color ?? "#ffffff",
    borderStyle: c.borderStyle ?? profile?.card_border_style ?? "solid",
    borderRadius: c.borderRadius ?? Number(profile?.card_border_radius ?? 12),
    glowEnabled: c.glowEnabled ?? Boolean(profile?.effect_glow),
    glowColor: c.glowColor ?? profile?.effect_glow_color ?? profile?.card_border_color,
    glowSize: c.glowSize ?? profile?.effect_glow_size ?? 24,
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
  const borderStyle = chrome.borderStyle === "none" ? "solid" : chrome.borderStyle;
  const borderWidth = chrome.borderStyle === "none" ? 0 : (chrome.borderWidth ?? 0);

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
  const glass = profile ? isCardGlassEnabled(profile) : false;

  const surfaceStyle: CSSProperties = {
    ...borderChrome.style,
    borderRadius: radius,
    overflow: "hidden",
  };

  return (
    <div
      className={`album-block-frame relative h-full w-full ${borderChrome.className} ${revealClass} ${profile ? cardGlassIsolationClass(profile) : ""}`}
      style={surfaceStyle}
    >
      {profile && glass ? (
        <div
          aria-hidden
          className={cardGlassClass(profile)}
          style={{
            ...cardGlassSurfaceLayerStyle(radius),
            ...cardSurfaceFillStyle(profile, glass),
          }}
        />
      ) : null}
      <div className="relative z-[1] h-full w-full min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
