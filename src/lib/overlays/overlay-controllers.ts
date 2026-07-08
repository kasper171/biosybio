import { BaseOverlayController } from "@/lib/overlays/base-overlay-controller";
import { DenseNoiseFrameCycler } from "@/lib/overlays/dense-noise-frame-cache";
import {
  drawGrain,
  drawScanlines,
  drawSparse,
  scanlineOffsetFromTime,
} from "@/lib/overlays/overlay-draw";

export class DenseNoiseOverlayController extends BaseOverlayController {
  private cycler = new DenseNoiseFrameCycler();

  protected renderFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    _timestamp: number,
  ): void {
    this.cycler.draw(ctx, width, height);
  }

  unmount(): void {
    this.cycler.reset();
    super.unmount();
  }
}

export class SparseNoiseOverlayController extends BaseOverlayController {
  protected renderFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    _timestamp: number,
  ): void {
    drawSparse(ctx, width, height, 0.04);
  }
}

export class ScanlinesOverlayController extends BaseOverlayController {
  protected renderFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timestamp: number,
  ): void {
    drawScanlines(ctx, width, height, scanlineOffsetFromTime(timestamp));
  }
}

export class FilmGrainOverlayController extends BaseOverlayController {
  protected renderFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    _timestamp: number,
  ): void {
    drawGrain(ctx, width, height, 0.08);
  }
}
