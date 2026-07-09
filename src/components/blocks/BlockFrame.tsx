import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { Profile } from "@/lib/profile-storage";
import type { ProfileBlock, ProfileBlockSize } from "@/lib/profile-blocks";
import { blockShowsCard } from "@/lib/profile-blocks";
import {
  getBlockFrameStyle,
  getBlockShapeBorderRadius,
  normalizeBlockShape,
  type BlockShape,
} from "@/lib/block-frame";
import {
  buildCardBorderChrome,
} from "@/lib/card-border";
import {
  cardGlassClass,
  cardGlassIsolationClass,
  cardGlassSurfaceLayerStyle,
  cardSurfaceFillStyle,
  isCardGlassEnabled,
} from "@/lib/card-glass";

type BlockFrameProps = {
  block: ProfileBlock;
  size: ProfileBlockSize;
  shape: BlockShape;
  showCard: boolean;
  sharedInRow?: boolean;
  variant: "inside" | "outside";
  profile: Profile;
  children: React.ReactNode;
};

function getProfileCardBorderChrome(
  profile: Profile,
  shape: BlockShape,
  size: ProfileBlockSize,
) {
  const bw = Number(profile.card_border_width ?? 0);
  const bc = profile.card_border_color ?? "#ffffff";
  const borderRadius = getBlockShapeBorderRadius(size, shape);

  return buildCardBorderChrome({
    borderWidth: bw,
    borderColor: bc,
    borderRadius,
    borderStyle: profile.card_border_style,
    glowEnabled: Boolean(profile.effect_glow),
    glowColor: profile.effect_glow_color ?? profile.card_border_color,
    glowSize: profile.effect_glow_size ?? 24,
  });
}

function BlockCardSurface({
  profile,
  borderRadius,
}: {
  profile: Profile;
  borderRadius: number;
}) {
  const glass = isCardGlassEnabled(profile);
  return (
    <div
      aria-hidden
      className={cardGlassClass(profile)}
      style={{
        ...cardGlassSurfaceLayerStyle(borderRadius),
        ...cardSurfaceFillStyle(profile, glass),
      }}
    />
  );
}

export function BlockFrame({
  size,
  shape,
  showCard,
  profile,
  flush,
  children,
}: BlockFrameProps & { flush?: boolean }) {
  const frameStyle = getBlockFrameStyle(size, shape);
  const borderChrome = showCard ? getProfileCardBorderChrome(profile, shape, size) : null;
  const surfaceRadius = Number(frameStyle.borderRadius ?? 0) || getBlockShapeBorderRadius(size, shape);

  return (
    <div
      className={`relative mx-auto w-full min-w-0 ${borderChrome?.className ?? ""}`}
      style={{
        ...frameStyle,
        ...(borderChrome?.style ?? {}),
        borderRadius: frameStyle.borderRadius,
      }}
    >
      {showCard ? <BlockCardSurface profile={profile} borderRadius={surfaceRadius} /> : null}
      <div className="relative z-[1] h-full w-full min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

export function OutsideBlockShell({
  profile,
  sharedInRow,
  shape,
  size,
  flush,
  children,
}: {
  profile: Profile;
  sharedInRow?: boolean;
  shape: BlockShape;
  size: ProfileBlockSize;
  /** Sem padding interno — conteúdo cola na borda do card */
  flush?: boolean;
  children: React.ReactNode;
}) {
  const frameStyle = getBlockFrameStyle(size, shape);
  const borderChrome = getProfileCardBorderChrome(profile, shape, size);
  const surfaceRadius = Number(frameStyle.borderRadius ?? 0) || getBlockShapeBorderRadius(size, shape);
  const isCompact = shape === "square" || shape === "round";
  const pad = flush ? 0 : isCompact ? 8 : sharedInRow ? 10 : 12;

  return (
    <div
      className={`relative ${cardGlassIsolationClass(profile)} mx-auto box-border ${borderChrome.className}`}
      style={{
        ...frameStyle,
        ...borderChrome.style,
        borderRadius: frameStyle.borderRadius,
        padding: pad,
      }}
    >
      <BlockCardSurface profile={profile} borderRadius={surfaceRadius} />
      <div className="relative z-[1] h-full w-full min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

/** Escala iframe (Spotify/YouTube) para caber no frame fixo */
export function ScaledEmbed({
  src,
  title,
  nativeHeight,
}: {
  src: string;
  title: string;
  nativeHeight: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const iframe = iframeRef.current;
    if (!wrap || !iframe) return;

    const apply = () => {
      const h = wrap.clientWidth > 0 ? wrap.clientHeight : 0;
      const w = wrap.clientWidth;
      if (h <= 0) return;
      const scale = h / nativeHeight;
      iframe.style.height = `${nativeHeight}px`;
      iframe.style.width = `${w / scale}px`;
      iframe.style.maxWidth = "100%";
      iframe.style.transform = `scale(${scale})`;
      iframe.style.transformOrigin = "top center";
      iframe.style.display = "block";
      iframe.style.marginLeft = "auto";
      iframe.style.marginRight = "auto";
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [nativeHeight, src]);

  return (
    <div ref={wrapRef} className="h-full w-full overflow-hidden">
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        className="border-0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  );
}

export function useBlockShape(block: ProfileBlock): BlockShape {
  return normalizeBlockShape(block.config.block_shape);
}

export function useBlockShowCard(block: ProfileBlock): boolean {
  return blockShowsCard(block);
}
