import type { OverlayController } from "@/lib/overlays/types";

const DEFAULT_OPACITY = 0.08;
const MAX_DPR = 2;

export abstract class BaseOverlayController implements OverlayController {
  protected canvas: HTMLCanvasElement | null = null;
  protected ctx: CanvasRenderingContext2D | null = null;
  protected container: HTMLElement | null = null;
  private rafId: number | null = null;
  private lastFrameAt = 0;
  private opacity = DEFAULT_OPACITY;
  private resizeObserver: ResizeObserver | null = null;

  protected frameIntervalMs = 80;

  protected abstract renderFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timestamp: number,
  ): void;

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

  protected getLogicalSize(): { width: number; height: number; dpr: number } {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    if (!this.canvas) {
      return { width: 1, height: 1, dpr };
    }
    return {
      width: Math.max(1, Math.floor(this.canvas.width / dpr)),
      height: Math.max(1, Math.floor(this.canvas.height / dpr)),
      dpr,
    };
  }

  private handleWindowResize = (): void => {
    this.syncCanvasSize();
  };

  private syncCanvasSize(): void {
    if (!this.canvas || !this.ctx || !this.container) return;
    const width = Math.max(1, Math.floor(this.container.clientWidth || window.innerWidth));
    const height = Math.max(1, Math.floor(this.container.clientHeight || window.innerHeight));
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.renderFrame(this.ctx, width, height, performance.now());
  }

  private tick = (timestamp: number): void => {
    if (!this.ctx || !this.canvas) return;

    if (timestamp - this.lastFrameAt >= this.frameIntervalMs) {
      const { width, height } = this.getLogicalSize();
      this.renderFrame(this.ctx, width, height, timestamp);
      this.lastFrameAt = timestamp;
    }

    this.rafId = window.requestAnimationFrame(this.tick);
  };
}
