import type { OverlayController } from "@/lib/overlays/types";

const DEFAULT_OPACITY = 0.08;

export type OverlayRenderConfig = {
  /** Escala do buffer interno vs área visível (1 = usa só maxBuffer*). */
  renderScale?: number;
  maxBufferWidth?: number;
  maxBufferHeight?: number;
  /** Intervalo entre frames. */
  frameIntervalMs?: number;
  /**
   * false = setTimeout (não compete com RAF das animações de entrada).
   * true = requestAnimationFrame (scanlines suaves).
   */
  useAnimationFrame?: boolean;
  /** pixelated para noise upscaled; auto para scanlines. */
  imageRendering?: CanvasImageRendering;
};

const DEFAULT_CONFIG: Required<Omit<OverlayRenderConfig, "imageRendering">> & {
  imageRendering: CanvasImageRendering;
} = {
  renderScale: 0.75,
  maxBufferWidth: Number.POSITIVE_INFINITY,
  maxBufferHeight: Number.POSITIVE_INFINITY,
  frameIntervalMs: 50,
  useAnimationFrame: true,
  imageRendering: "auto",
};

export abstract class BaseOverlayController implements OverlayController {
  protected canvas: HTMLCanvasElement | null = null;
  protected ctx: CanvasRenderingContext2D | null = null;
  protected container: HTMLElement | null = null;
  protected frameIntervalMs: number;

  private rafId: number | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private lastFrameAt = 0;
  private opacity = DEFAULT_OPACITY;
  private resizeObserver: ResizeObserver | null = null;
  private bufferWidth = 1;
  private bufferHeight = 1;
  private readonly config: Required<OverlayRenderConfig>;
  private readonly useAnimationFrame: boolean;
  private visible = true;

  protected abstract renderFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timestamp: number,
  ): void;

  constructor(config?: OverlayRenderConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.frameIntervalMs = this.config.frameIntervalMs;
    this.useAnimationFrame = this.config.useAnimationFrame;
  }

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
      willChange: "opacity",
      transform: "translateZ(0)",
      imageRendering: this.config.imageRendering,
    });

    container.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    } as CanvasRenderingContext2DSettings);

    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    this.syncCanvasSize();
    this.resizeObserver = new ResizeObserver(() => this.syncCanvasSize());
    this.resizeObserver.observe(container);
    window.addEventListener("resize", this.handleWindowResize);

    this.lastFrameAt = 0;
    this.startLoop();
  }

  unmount(): void {
    this.stopLoop();
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
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

  private handleVisibilityChange(): void {
    this.visible = !document.hidden;
    if (this.visible) {
      this.startLoop();
    } else {
      this.stopLoop();
    }
  }

  private handleWindowResize = (): void => {
    this.syncCanvasSize();
  };

  private syncCanvasSize(): void {
    if (!this.canvas || !this.ctx || !this.container) return;
    const displayWidth = Math.max(1, Math.floor(this.container.clientWidth || window.innerWidth));
    const displayHeight = Math.max(1, Math.floor(this.container.clientHeight || window.innerHeight));

    let bufferWidth = Math.max(1, Math.floor(displayWidth * this.config.renderScale));
    let bufferHeight = Math.max(1, Math.floor(displayHeight * this.config.renderScale));

    if (Number.isFinite(this.config.maxBufferWidth)) {
      bufferWidth = Math.min(bufferWidth, this.config.maxBufferWidth);
    }
    if (Number.isFinite(this.config.maxBufferHeight)) {
      bufferHeight = Math.min(bufferHeight, this.config.maxBufferHeight);
    }

    this.bufferWidth = bufferWidth;
    this.bufferHeight = bufferHeight;
    this.canvas.width = bufferWidth;
    this.canvas.height = bufferHeight;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.renderFrame(this.ctx, bufferWidth, bufferHeight, performance.now());
  }

  private startLoop(): void {
    this.stopLoop();
    if (this.useAnimationFrame) {
      this.rafId = window.requestAnimationFrame(this.tickRaf);
    } else {
      this.timeoutId = window.setTimeout(this.tickTimer, this.frameIntervalMs);
    }
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private tickRaf = (timestamp: number): void => {
    if (!this.ctx || !this.canvas || !this.visible) return;

    if (timestamp - this.lastFrameAt >= this.frameIntervalMs) {
      const { width, height } = this.getBufferSize();
      this.renderFrame(this.ctx, width, height, timestamp);
      this.lastFrameAt = timestamp;
    }

    this.rafId = window.requestAnimationFrame(this.tickRaf);
  };

  private tickTimer = (): void => {
    if (!this.ctx || !this.canvas || !this.visible) {
      this.timeoutId = window.setTimeout(this.tickTimer, this.frameIntervalMs);
      return;
    }

    const { width, height } = this.getBufferSize();
    this.renderFrame(this.ctx, width, height, performance.now());
    this.timeoutId = window.setTimeout(this.tickTimer, this.frameIntervalMs);
  };
}
