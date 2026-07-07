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
import { hexToRgba } from "@/lib/profile-colors";
import {
  buildCardGlowShadow,
  buildCardSolidBorderShadow,
  cardBorderStyleClass,
  combineBoxShadows,
  normalizeCardBorderStyle,
} from "@/lib/card-border";

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

function getProfileCardChrome(
  profile: Profile,
  shape: BlockShape,
  size: ProfileBlockSize,
  options?: { transparentFill?: boolean },
) {
  const bw = Number(profile.card_border_width ?? 0);
  const bc = profile.card_border_color ?? "#ffffff";
  const borderStyle = normalizeCardBorderStyle(profile.card_border_style);
  const borderRadius = getBlockShapeBorderRadius(size, shape);
  const useCssBorder = bw > 0;

  const style: CSSProperties = {
    borderRadius,
    backdropFilter: options?.transparentFill ? undefined : `blur(${profile.card_blur}px)`,
    WebkitBackdropFilter: options?.transparentFill ? undefined : `blur(${profile.card_blur}px)`,
    boxSizing: "border-box",
    boxShadow: combineBoxShadows(
      useCssBorder ? null : buildCardSolidBorderShadow(bw, bc),
      buildCardGlowShadow(
        Boolean(profile.effect_glow),
        profile.effect_glow_color ?? profile.card_border_color,
        profile.effect_glow_size ?? 24,
      ),
    ),
  };

  if (!options?.transparentFill) {
    style.background = hexToRgba(profile.card_color, profile.card_opacity);
  }

  if (useCssBorder) {
    style.borderWidth = bw;
    style.borderStyle = borderStyle;
    style.borderColor = bc;
  }

  const className = useCssBorder ? cardBorderStyleClass(borderStyle) : "";

  return { style, className };
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
  const cardChrome = showCard
    ? getProfileCardChrome(profile, shape, size, { transparentFill: flush })
    : null;

  return (
    <div
      className={`relative mx-auto w-full min-w-0 overflow-hidden ${cardChrome?.className ?? ""}`}
      style={{
        ...frameStyle,
        ...(cardChrome?.style ?? {}),
        borderRadius: frameStyle.borderRadius,
      }}
    >
      <div className="absolute inset-0 overflow-hidden">{children}</div>
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
  const cardChrome = getProfileCardChrome(profile, shape, size, { transparentFill: flush });
  const isCompact = shape === "square" || shape === "round";
  const pad = flush ? 0 : isCompact ? 8 : sharedInRow ? 10 : 12;

  return (
    <div
      className={`relative isolate mx-auto box-border overflow-hidden ${cardChrome.className}`}
      style={{
        ...frameStyle,
        ...cardChrome.style,
        borderRadius: frameStyle.borderRadius,
        padding: pad,
      }}
    >
      <div className="relative h-full w-full min-h-0 overflow-hidden">{children}</div>
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
