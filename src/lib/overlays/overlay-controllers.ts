import { BaseOverlayController } from "@/lib/overlays/base-overlay-controller";
import { DenseNoiseFrameCycler, SparseNoiseFrameCycler } from "@/lib/overlays/noise-frame-cache";
import type { OverlayRuntimeOptions } from "@/lib/overlays/types";
import { drawScanlines, scanlineOffsetFromTime } from "@/lib/overlays/overlay-draw";
import { OVERLAY_COLOR_DEFAULT } from "@/lib/overlays/profile-overlays";

/** Resolução 0.75 + buffer real — mesma densidade visual de antes. */
const ANIMATED_OVERLAY_CONFIG = {
  renderScale: 0.75,
  frameIntervalMs: 50,
  useAnimationFrame: false,
  imageRendering: "auto" as CanvasImageRendering,
} as const;

const SCANLINE_CONFIG = {
  renderScale: 0.75,
  frameIntervalMs: 50,
  useAnimationFrame: true,
  imageRendering: "auto" as CanvasImageRendering,
} as const;

export class DenseNoiseOverlayController extends BaseOverlayController {
  private cycler = new DenseNoiseFrameCycler();

  constructor(options?: OverlayRuntimeOptions) {
    super(ANIMATED_OVERLAY_CONFIG);
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
    super(ANIMATED_OVERLAY_CONFIG);
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
