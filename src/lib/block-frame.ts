import type { CSSProperties } from "react";
import type { ProfileBlock, ProfileBlockSize } from "@/lib/profile-blocks";

export type BlockShape = "rectangle" | "square" | "round";

export const BLOCK_SHAPE_LABELS: Record<BlockShape, string> = {
  rectangle: "Retângulo",
  square: "Quadrado",
  round: "Redondo",
};

const RECT_HEIGHT: Record<ProfileBlockSize, number> = {
  sm: 80,
  md: 136,
  lg: 224,
};

const SQUARE_SIDE: Record<ProfileBlockSize, number> = {
  sm: 92,
  md: 148,
  lg: 228,
};

const RECT_RADIUS: Record<ProfileBlockSize, number> = {
  sm: 10,
  md: 14,
  lg: 18,
};

const SQUARE_RADIUS: Record<ProfileBlockSize, number> = {
  sm: 12,
  md: 16,
  lg: 20,
};

export function normalizeBlockShape(shape: unknown): BlockShape {
  if (shape === "square" || shape === "round") return shape;
  return "rectangle";
}

export function getBlockShapeBorderRadius(
  size: ProfileBlockSize,
  shape: BlockShape,
): CSSProperties["borderRadius"] {
  if (shape === "round") return "50%";
  if (shape === "square") return SQUARE_RADIUS[size];
  return RECT_RADIUS[size];
}

export function getBlockFrameHeight(block: ProfileBlock): number {
  const size = block.config.size ?? "sm";
  const shape = normalizeBlockShape(block.config.block_shape);
  if (shape === "rectangle") return RECT_HEIGHT[size];
  return SQUARE_SIDE[size];
}

/** Estilo fixo do container — mesmo tamanho para qualquer tipo de bloco */
export function getBlockFrameStyle(
  size: ProfileBlockSize,
  shape: BlockShape,
): CSSProperties {
  const borderRadius = getBlockShapeBorderRadius(size, shape);

  if (shape === "square" || shape === "round") {
    const side = SQUARE_SIDE[size];
    return {
      width: "100%",
      maxWidth: side,
      height: side,
      marginInline: "auto",
      borderRadius,
    };
  }

  return {
    width: "100%",
    height: RECT_HEIGHT[size],
    borderRadius,
  };
}

export function getBlockFrameInnerHeight(block: ProfileBlock): number {
  return getBlockFrameHeight(block);
}
