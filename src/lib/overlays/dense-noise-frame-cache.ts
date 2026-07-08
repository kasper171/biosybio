import { drawDenseNoise } from "@/lib/overlays/overlay-draw";

/** Frames pré-calculados — o loop só alterna entre eles (mais leve na CPU). */
export const DENSE_NOISE_PREBUFFER_COUNT = 10;

export function buildDenseNoiseFrameCache(
  width: number,
  height: number,
  count = DENSE_NOISE_PREBUFFER_COUNT,
): ImageData[] {
  const scratch = document.createElement("canvas");
  scratch.width = width;
  scratch.height = height;
  const scratchCtx = scratch.getContext("2d", { alpha: true });
  if (!scratchCtx) return [];

  const frames: ImageData[] = [];
  for (let i = 0; i < count; i++) {
    drawDenseNoise(scratchCtx, width, height);
    frames.push(scratchCtx.getImageData(0, 0, width, height));
  }
  return frames;
}

/** Alterna entre frames pré-gerados; regenera o cache se width/height mudar. */
export class DenseNoiseFrameCycler {
  private frames: ImageData[] = [];
  private index = 0;
  private width = 0;
  private height = 0;

  draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (
      width !== this.width ||
      height !== this.height ||
      this.frames.length === 0
    ) {
      this.frames = buildDenseNoiseFrameCache(width, height);
      this.width = width;
      this.height = height;
      this.index = 0;
    }

    const frame = this.frames[this.index];
    if (!frame) return;

    ctx.putImageData(frame, 0, 0);
    this.index = (this.index + 1) % this.frames.length;
  }

  reset(): void {
    this.frames = [];
    this.index = 0;
    this.width = 0;
    this.height = 0;
  }
}
