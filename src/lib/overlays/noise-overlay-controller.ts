import type { OverlayController } from "@/lib/overlays/types";

const FRAME_INTERVAL_MS = 80;
const OVERLAY_DEFAULT_OPACITY = 0.08;

function drawNoise(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.createImageData(width, height);
  const buffer = imageData.data;
  for (let i = 0; i < buffer.length; i += 4) {
    const v = Math.random() * 255;
    buffer[i] = v;
    buffer[i + 1] = v;
    buffer[i + 2] = v;
    buffer[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

export class NoiseOverlayController implements OverlayController {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private container: HTMLElement | null = null;
  private rafId: number | null = null;
  private lastFrameAt = 0;
  private opacity = OVERLAY_DEFAULT_OPACITY;
  private resizeObserver: ResizeObserver | null = null;

  mount(container: HTMLElement): void {
    this.unmount();
    this.container = container;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.opacity = String(this.opacity);

    container.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: true });

    this.syncCanvasSize();
    this.resizeObserver = new ResizeObserver(() => this.syncCanvasSize());
    this.resizeObserver.observe(container);
    window.addEventListener("resize", this.handleWindowResize);

    this.lastFrameAt = 0;
    this.rafId = window.requestAnimationFrame(this.tick);
  }

  unmount(): void {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    window.removeEventListener("resize", this.handleWindowResize);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.canvas?.remove();
    this.canvas = null;
    this.ctx = null;
    this.container = null;
  }

  setOpacity(opacity: number): void {
    this.opacity = Math.min(1, Math.max(0, opacity));
    if (this.canvas) {
      this.canvas.style.opacity = String(this.opacity);
    }
  }

  private handleWindowResize = (): void => {
    this.syncCanvasSize();
  };

  private syncCanvasSize(): void {
    if (!this.canvas || !this.ctx || !this.container) return;
    const width = Math.max(1, Math.floor(this.container.clientWidth || window.innerWidth));
    const height = Math.max(1, Math.floor(this.container.clientHeight || window.innerHeight));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawNoise(this.ctx, width, height);
  }

  private tick = (timestamp: number): void => {
    if (!this.ctx || !this.canvas) return;

    if (timestamp - this.lastFrameAt >= FRAME_INTERVAL_MS) {
      const width = Math.max(1, Math.floor(this.canvas.width / Math.min(window.devicePixelRatio || 1, 2)));
      const height = Math.max(1, Math.floor(this.canvas.height / Math.min(window.devicePixelRatio || 1, 2)));
      drawNoise(this.ctx, width, height);
      this.lastFrameAt = timestamp;
    }

    this.rafId = window.requestAnimationFrame(this.tick);
  };
}

export function createNoiseOverlayController(): OverlayController {
  return new NoiseOverlayController();
}
