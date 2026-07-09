import type { OverlayController } from "@/lib/overlays/types";

const DEFAULT_OPACITY = 0.08;
/** Renderiza em resolução reduzida e upscale via CSS — menos custo de putImageData. */
const RENDER_SCALE = 0.75;
const MAX_DPR = 1;

export abstract class BaseOverlayController implements OverlayController {
  protected canvas: HTMLCanvasElement | null = null;
  protected ctx: CanvasRenderingContext2D | null = null;
  protected container: HTMLElement | null = null;
  private rafId: number | null = null;
  private lastFrameAt = 0;
  private opacity = DEFAULT_OPACITY;
  private resizeObserver: ResizeObserver | null = null;
  private bufferWidth = 1;
  private bufferHeight = 1;

  protected frameIntervalMs = 50;

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
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      opacity: String(this.opacity),
      willChange: "opacity, transform",
      transform: "translateZ(0)",
      imageRendering: "auto",
    });

    container.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    } as CanvasRenderingContext2DSettings);

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

  protected getBufferSize(): { width: number; height: number } {
    return { width: this.bufferWidth, height: this.bufferHeight };
  }

  private handleWindowResize = (): void => {
    this.syncCanvasSize();
  };

  private syncCanvasSize(): void {
    if (!this.canvas || !this.ctx || !this.container) return;
    const displayWidth = Math.max(1, Math.floor(this.container.clientWidth || window.innerWidth));
    const displayHeight = Math.max(1, Math.floor(this.container.clientHeight || window.innerHeight));
    const scale = RENDER_SCALE * MAX_DPR;
    this.bufferWidth = Math.max(1, Math.floor(displayWidth * scale));
    this.bufferHeight = Math.max(1, Math.floor(displayHeight * scale));
    this.canvas.width = this.bufferWidth;
    this.canvas.height = this.bufferHeight;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.renderFrame(this.ctx, this.bufferWidth, this.bufferHeight, performance.now());
  }

  private tick = (timestamp: number): void => {
    if (!this.ctx || !this.canvas) return;

    if (timestamp - this.lastFrameAt >= this.frameIntervalMs) {
      const { width, height } = this.getBufferSize();
      this.renderFrame(this.ctx, width, height, timestamp);
      this.lastFrameAt = timestamp;
    }

    this.rafId = window.requestAnimationFrame(this.tick);
  };
}
