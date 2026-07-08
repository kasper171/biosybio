import { BaseOverlayController } from "@/lib/overlays/base-overlay-controller";
import {
  drawDenseNoise,
  drawGrain,
  drawScanlines,
  drawSparse,
  scanlineOffsetFromTime,
} from "@/lib/overlays/overlay-draw";

export class DenseNoiseOverlayController extends BaseOverlayController {
  protected renderFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    _timestamp: number,
  ): void {
    drawDenseNoise(ctx, width, height);
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
