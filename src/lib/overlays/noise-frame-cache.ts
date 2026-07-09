import {
  DENSE_NOISE_FRAME_COUNT,
  DENSE_NOISE_TILE_SIZE,
  GRAIN_BUFFER_HEIGHT,
  GRAIN_BUFFER_WIDTH,
  NOISE_FRAME_CACHE_COUNT,
} from "@/lib/overlays/overlay-render-config";
import { OVERLAY_COLOR_DEFAULT } from "@/lib/overlays/profile-overlays";
import { drawDenseNoise, drawSparseImageData } from "@/lib/overlays/overlay-draw";

/** Noise denso: tiles 128×128 upscaled via drawImage (sem putImageData fullscreen). */
export class DenseNoiseFrameCycler {
  private tiles: HTMLCanvasElement[] = [];
  private index = 0;
  private color = OVERLAY_COLOR_DEFAULT;

  setColor(color: string): void {
    if (color === this.color) return;
    this.color = color;
    this.reset();
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (this.tiles.length === 0) {
      for (let i = 0; i < DENSE_NOISE_FRAME_COUNT; i++) {
        const tile = document.createElement("canvas");
        tile.width = DENSE_NOISE_TILE_SIZE;
        tile.height = DENSE_NOISE_TILE_SIZE;
        const tileCtx = tile.getContext("2d", { alpha: true });
        if (!tileCtx) continue;
        drawDenseNoise(tileCtx, DENSE_NOISE_TILE_SIZE, DENSE_NOISE_TILE_SIZE, this.color);
        this.tiles.push(tile);
      }
    }

    const tile = this.tiles[this.index];
    if (!tile) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(tile, 0, 0, width, height);
    this.index = (this.index + 1) % this.tiles.length;
  }

  reset(): void {
    this.tiles = [];
    this.index = 0;
  }
}

type ImageDataFrameCacheOptions = {
  width: number;
  height: number;
  count: number;
  getColor: () => string;
  buildFrame: (width: number, height: number, color: string) => ImageData;
};

class ImageDataFrameCycler {
  private frames: ImageData[] = [];
  private index = 0;
  private scratch: HTMLCanvasElement | null = null;
  private cachedColor = "";
  private readonly width: number;
  private readonly height: number;
  private readonly count: number;
  private readonly getColor: () => string;
  private readonly buildFrame: (width: number, height: number, color: string) => ImageData;

  constructor(options: ImageDataFrameCacheOptions) {
    this.width = options.width;
    this.height = options.height;
    this.count = options.count;
    this.getColor = options.getColor;
    this.buildFrame = options.buildFrame;
  }

  setColor(color: string): void {
    if (color === this.cachedColor) return;
    this.cachedColor = color;
    this.reset();
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const color = this.getColor();
    if (this.frames.length === 0 || color !== this.cachedColor) {
      this.cachedColor = color;
      this.frames = [];
      for (let i = 0; i < this.count; i++) {
        this.frames.push(this.buildFrame(this.width, this.height, color));
      }
    }

    const frame = this.frames[this.index];
    if (!frame) return;

    if (!this.scratch) {
      this.scratch = document.createElement("canvas");
    }
    this.scratch.width = this.width;
    this.scratch.height = this.height;
    const scratchCtx = this.scratch.getContext("2d", { alpha: true });
    if (!scratchCtx) return;

    scratchCtx.putImageData(frame, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(this.scratch, 0, 0, width, height);
    this.index = (this.index + 1) % this.frames.length;
  }

  reset(): void {
    this.frames = [];
    this.index = 0;
    this.scratch = null;
  }
}

export class SparseNoiseFrameCycler {
  private color = OVERLAY_COLOR_DEFAULT;
  private cycler = new ImageDataFrameCycler({
    width: GRAIN_BUFFER_WIDTH,
    height: GRAIN_BUFFER_HEIGHT,
    count: NOISE_FRAME_CACHE_COUNT,
    getColor: () => this.color,
    buildFrame: (w, h, c) => drawSparseImageData(w, h, 0.04, c),
  });

  setColor(color: string): void {
    if (color === this.color) return;
    this.color = color;
    this.cycler.setColor(color);
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    this.cycler.draw(ctx, width, height);
  }

  reset(): void {
    this.cycler.reset();
  }
}
