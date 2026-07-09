import { BaseOverlayController } from "@/lib/overlays/base-overlay-controller";
import { DenseNoiseFrameCycler, SparseNoiseFrameCycler } from "@/lib/overlays/noise-frame-cache";
import type { OverlayRuntimeOptions } from "@/lib/overlays/types";
import {
  NOISE_FRAME_INTERVAL_MS,
  NOISE_MAX_BUFFER_HEIGHT,
  NOISE_MAX_BUFFER_WIDTH,
  NOISE_RENDER_SCALE,
  SCANLINE_FRAME_INTERVAL_MS,
  SCANLINE_RENDER_SCALE,
} from "@/lib/overlays/overlay-render-config";
import { drawScanlines, scanlineOffsetFromTime } from "@/lib/overlays/overlay-draw";
import { OVERLAY_COLOR_DEFAULT } from "@/lib/overlays/profile-overlays";

const NOISE_CONFIG = {
  renderScale: NOISE_RENDER_SCALE,
  maxBufferWidth: NOISE_MAX_BUFFER_WIDTH,
  maxBufferHeight: NOISE_MAX_BUFFER_HEIGHT,
  frameIntervalMs: NOISE_FRAME_INTERVAL_MS,
  useAnimationFrame: false,
  imageRendering: "pixelated" as CanvasImageRendering,
} as const;

const SCANLINE_CONFIG = {
  renderScale: SCANLINE_RENDER_SCALE,
  frameIntervalMs: SCANLINE_FRAME_INTERVAL_MS,
  useAnimationFrame: true,
  imageRendering: "auto" as CanvasImageRendering,
} as const;

export class DenseNoiseOverlayController extends BaseOverlayController {
  private cycler = new DenseNoiseFrameCycler();

  constructor(options?: OverlayRuntimeOptions) {
    super(NOISE_CONFIG);
    if (options?.color) this.cycler.setColor(options.color);
  }

  protected renderFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    _timestamp: number,
  ): void {
    this.cycler.draw(ctx, width, height);
  }

  setColor(color: string): void {
    this.cycler.setColor(color);
  }

  unmount(): void {
    this.cycler.reset();
    super.unmount();
  }
}

export class SparseNoiseOverlayController extends BaseOverlayController {
  private cycler = new SparseNoiseFrameCycler();

  constructor(options?: OverlayRuntimeOptions) {
    super(NOISE_CONFIG);
    if (options?.color) this.cycler.setColor(options.color);
  }

  protected renderFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    _timestamp: number,
  ): void {
    this.cycler.draw(ctx, width, height);
  }

  setColor(color: string): void {
    this.cycler.setColor(color);
  }

  unmount(): void {
    this.cycler.reset();
    super.unmount();
  }
}

export class ScanlinesOverlayController extends BaseOverlayController {
  private color = OVERLAY_COLOR_DEFAULT;

  constructor(options?: OverlayRuntimeOptions) {
    super(SCANLINE_CONFIG);
    if (options?.color) this.color = options.color;
  }

  protected renderFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timestamp: number,
  ): void {
    drawScanlines(ctx, width, height, scanlineOffsetFromTime(timestamp), this.color);
  }

  setColor(color: string): void {
    this.color = color;
  }
}
