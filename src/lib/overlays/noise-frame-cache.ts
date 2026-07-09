import { drawDenseNoise, drawSparseImageData } from "@/lib/overlays/overlay-draw";
import { OVERLAY_COLOR_DEFAULT } from "@/lib/overlays/profile-overlays";

/** Frames pré-calculados em resolução real do buffer — sem upscale (evita noise “grosso”). */
export const DENSE_NOISE_FRAME_COUNT = 10;
export const SPARSE_NOISE_FRAME_COUNT = 8;

export class DenseNoiseFrameCycler {
  private frames: ImageData[] = [];
  private index = 0;
  private width = 0;
  private height = 0;
  private color = OVERLAY_COLOR_DEFAULT;

  setColor(color: string): void {
    if (color === this.color) return;
    this.color = color;
    this.reset();
  }

  private rebuild(width: number, height: number): void {
    const scratch = document.createElement("canvas");
    scratch.width = width;
    scratch.height = height;
    const scratchCtx = scratch.getContext("2d", { alpha: true });
    if (!scratchCtx) return;

    this.frames = [];
    for (let i = 0; i < DENSE_NOISE_FRAME_COUNT; i++) {
      drawDenseNoise(scratchCtx, width, height, this.color);
      this.frames.push(scratchCtx.getImageData(0, 0, width, height));
    }
    this.width = width;
    this.height = height;
    this.index = 0;
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (width !== this.width || height !== this.height || this.frames.length === 0) {
      this.rebuild(width, height);
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

export class SparseNoiseFrameCycler {
  private frames: ImageData[] = [];
  private index = 0;
  private width = 0;
  private height = 0;
  private color = OVERLAY_COLOR_DEFAULT;

  setColor(color: string): void {
    if (color === this.color) return;
    this.color = color;
    this.reset();
  }

  private rebuild(width: number, height: number): void {
    this.frames = [];
    for (let i = 0; i < SPARSE_NOISE_FRAME_COUNT; i++) {
      this.frames.push(drawSparseImageData(width, height, 0.04, this.color));
    }
    this.width = width;
    this.height = height;
    this.index = 0;
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (width !== this.width || height !== this.height || this.frames.length === 0) {
      this.rebuild(width, height);
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
