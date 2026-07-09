/** Funções de desenho compartilhadas entre overlay runtime e previews. */

import { hexToRgb } from "@/lib/overlays/static-texture-styles";
import { OVERLAY_COLOR_DEFAULT } from "@/lib/overlays/profile-overlays";

export function drawDenseNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color = OVERLAY_COLOR_DEFAULT,
): void {
  const { r, g, b } = hexToRgb(color);
  const imageData = ctx.createImageData(width, height);
  const buffer = imageData.data;
  for (let i = 0; i < buffer.length; i += 4) {
    const v = Math.random();
    buffer[i] = Math.round(r * v);
    buffer[i + 1] = Math.round(g * v);
    buffer[i + 2] = Math.round(b * v);
    buffer[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

export function drawSparseImageData(
  width: number,
  height: number,
  density = 0.04,
  color = OVERLAY_COLOR_DEFAULT,
): ImageData {
  const { r, g, b } = hexToRgb(color);
  const imageData = new ImageData(width, height);
  const buffer = imageData.data;
  const pixelCount = width * height;
  const count = Math.floor(pixelCount * density);
  for (let i = 0; i < count; i++) {
    const px = Math.floor(Math.random() * pixelCount) * 4;
    buffer[px] = r;
    buffer[px + 1] = g;
    buffer[px + 2] = b;
    buffer[px + 3] = 255;
  }
  return imageData;
}

export function drawSparse(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  density = 0.04,
  color = OVERLAY_COLOR_DEFAULT,
): void {
  ctx.clearRect(0, 0, width, height);
  ctx.putImageData(drawSparseImageData(width, height, density, color), 0, 0);
}

export function drawScanlines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  offset: number,
  color = OVERLAY_COLOR_DEFAULT,
): void {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = color;
  for (let y = offset; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1);
  }
}

export function scanlineOffsetFromTime(timestamp = Date.now()): number {
  return (timestamp / 50) % 4;
}
