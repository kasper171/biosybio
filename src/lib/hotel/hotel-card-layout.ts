import type { CSSProperties } from "react";
import {
  DEFAULT_CARD_HEIGHT,
  DEFAULT_CARD_WIDTH,
  type Profile,
} from "@/lib/profile-storage";

export type HotelCardPlacement = "inside" | "outside";
export type HotelCardRow = "same_row" | "separate_row";
export type HotelCardShape = "square" | "rectangle";
export type HotelCardSize = "sm" | "md" | "lg";

export type HotelCardLayoutConfig = {
  placement: HotelCardPlacement;
  row: HotelCardRow;
  shape: HotelCardShape;
  size: HotelCardSize;
};

export const HOTEL_CARD_PLACEMENT_LABELS: Record<HotelCardPlacement, string> = {
  inside: "Inside main card",
  outside: "Separate card",
};

export const HOTEL_CARD_ROW_LABELS: Record<HotelCardRow, string> = {
  same_row: "Beside",
  separate_row: "Below",
};

export const HOTEL_CARD_SHAPE_LABELS: Record<HotelCardShape, string> = {
  rectangle: "Rectangle",
  square: "Square",
};

export const HOTEL_CARD_SIZE_LABELS: Record<HotelCardSize, string> = {
  sm: "Small",
  md: "Medium",
  lg: "Large",
};

const RECT_HEIGHT: Record<HotelCardSize, number> = {
  sm: 96,
  md: 140,
  lg: 200,
};

const SQUARE_SIDE: Record<HotelCardSize, number> = {
  sm: 108,
  md: 152,
  lg: 220,
};

const RECT_RADIUS: Record<HotelCardSize, number> = {
  sm: 12,
  md: 14,
  lg: 18,
};

const SQUARE_RADIUS: Record<HotelCardSize, number> = {
  sm: 14,
  md: 16,
  lg: 20,
};

/** Área fixa do avatar — mesmo enquadramento em Habbo e Habblet */
export const HOTEL_AVATAR_SLOT: Record<HotelCardSize, { width: number; height: number }> = {
  sm: { width: 64, height: 88 },
  md: { width: 80, height: 110 },
  lg: { width: 96, height: 132 },
};

export function normalizeHotelCardSize(size: unknown): HotelCardSize {
  if (size === "sm" || size === "md" || size === "lg") return size;
  return "md";
}

export function normalizeHotelCardShape(shape: unknown): HotelCardShape {
  return shape === "square" ? "square" : "rectangle";
}

export function getHotelCardLayoutFromProfile(profile: Profile): HotelCardLayoutConfig {
  return {
    placement: profile.hotel_card_placement === "outside" ? "outside" : "inside",
    row: profile.hotel_card_row === "same_row" ? "same_row" : "separate_row",
    shape: normalizeHotelCardShape(profile.hotel_card_shape),
    size: normalizeHotelCardSize(profile.hotel_card_size),
  };
}

/** No celular/tablet: hotel fora do card sempre abaixo, em retângulo horizontal. */
export function resolveHotelLayoutForViewport(
  layout: HotelCardLayoutConfig,
  compact: boolean,
): HotelCardLayoutConfig {
  if (!compact) return layout;

  const rectangle: HotelCardShape = "rectangle";

  if (layout.placement === "outside" && layout.row === "same_row") {
    return { ...layout, row: "separate_row", shape: rectangle };
  }

  if (layout.shape === "square") {
    return { ...layout, shape: rectangle };
  }

  return layout;
}

export function getHotelCardFrameStyle(
  size: HotelCardSize,
  shape: HotelCardShape,
): CSSProperties {
  if (shape === "square") {
    const side = SQUARE_SIDE[size];
    return {
      width: "100%",
      maxWidth: side,
      height: side,
      marginInline: "auto",
      borderRadius: SQUARE_RADIUS[size],
    };
  }

  return {
    width: "100%",
    height: RECT_HEIGHT[size],
    borderRadius: RECT_RADIUS[size],
  };
}

export function getHotelCardBorderRadius(
  size: HotelCardSize,
  shape: HotelCardShape,
): number {
  return shape === "square" ? SQUARE_RADIUS[size] : RECT_RADIUS[size];
}

/** Espaço entre cards empilhados na coluna "ao lado" */
export const HOTEL_BESIDE_GAP_PX = 12;

/** Espaço entre cards na linha "abaixo" */
export const HOTEL_BELOW_GAP_PX = 8;

/** Finura horizontal da coluna retângulo "ao lado" (altura = sempre a do card principal) */
const BESIDE_RECT_WIDTH_SCALE: Record<HotelCardSize, number> = {
  sm: 0.22,
  md: 0.3,
  lg: 0.38,
};

export type HotelBesideColumnDimensions = {
  width: number;
  height: number;
};

/** Coluna ao lado: altura fixa do card principal; tamanho só altera a largura */
export function getHotelBesideColumnDimensions(
  mainCardWidth: number,
  mainCardHeight: number,
  shape: HotelCardShape,
  size: HotelCardSize,
  slotCount: 1 | 2,
  gapPx: number = HOTEL_BESIDE_GAP_PX,
): HotelBesideColumnDimensions {
  const columnHeight = mainCardHeight;
  const slotHeight = slotCount === 1 ? columnHeight : (columnHeight - gapPx) / 2;

  if (shape === "square") {
    return {
      width: Math.min(mainCardWidth, Math.round(slotHeight)),
      height: columnHeight,
    };
  }

  const width = Math.min(
    mainCardWidth,
    Math.max(120, Math.min(300, Math.round(mainCardHeight * BESIDE_RECT_WIDTH_SCALE[size]))),
  );

  return { width, height: columnHeight };
}

/** @deprecated use getHotelBesideColumnDimensions */
export function getHotelBesideColumnWidth(
  mainCardWidth: number,
  mainCardHeight: number,
  shape: HotelCardShape,
  slotCount: 1 | 2,
  gapPx: number = HOTEL_BESIDE_GAP_PX,
): number {
  return getHotelBesideColumnDimensions(
    mainCardWidth,
    mainCardHeight,
    shape,
    "md",
    slotCount,
    gapPx,
  ).width;
}

export type HotelBesideSlot = {
  mainCardHeight: number;
  mainCardWidth: number;
  slotIndex: number;
  slotCount: 1 | 2;
  gapPx?: number;
};

export type HotelBelowSlot = {
  mainCardWidth: number;
  slotIndex: number;
  slotCount: 1 | 2;
  gapPx?: number;
};

export function getMainCardDimensions(profile: Profile): { width: number; height: number } {
  return {
    width: Number(profile.card_width ?? DEFAULT_CARD_WIDTH) || DEFAULT_CARD_WIDTH,
    height: Number(profile.card_height ?? DEFAULT_CARD_HEIGHT) || DEFAULT_CARD_HEIGHT,
  };
}

export function getHotelBesideSlotHeight(slot: HotelBesideSlot): number {
  const gap = slot.gapPx ?? HOTEL_BESIDE_GAP_PX;
  if (slot.slotCount === 1) return slot.mainCardHeight;
  return (slot.mainCardHeight - gap) / 2;
}

/** Frame portrait na coluna ao lado — preenche o slot pai */
export function getHotelBesideFrameStyle(
  profile: Profile,
  size: HotelCardSize,
  shape: HotelCardShape,
  fillParent?: boolean,
): CSSProperties {
  // O arredondamento é GLOBAL (card principal). 0 deve permanecer 0.
  const radiusRaw = Number(profile.card_border_radius ?? 16);
  const radius = Number.isFinite(radiusRaw) ? radiusRaw : 16;

  if (fillParent) {
    return {
      width: "100%",
      height: "100%",
      borderRadius: radius,
    };
  }
  return {
    width: "100%",
    height: "100%",
    borderRadius: radius,
  };
}

/** Frame horizontal na faixa abaixo do card principal */
export function getHotelBelowFrameStyle(
  profile: Profile,
  size: HotelCardSize,
  shape: HotelCardShape,
  fillParent?: boolean,
): CSSProperties {
  // O arredondamento é GLOBAL (card principal). 0 deve permanecer 0.
  const radiusRaw = Number(profile.card_border_radius ?? 16);
  const radius = Number.isFinite(radiusRaw) ? radiusRaw : 16;
  const fixedHeight = shape === "square" ? SQUARE_SIDE[size] : RECT_HEIGHT[size];

  if (fillParent) {
    return {
      width: "100%",
      height: fixedHeight,
      borderRadius: radius,
    };
  }

  return {
    width: "100%",
    height: fixedHeight,
    borderRadius: radius,
  };
}
