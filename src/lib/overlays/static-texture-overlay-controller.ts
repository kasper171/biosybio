import { applyStaticTextureStyles } from "@/lib/overlays/static-texture-styles";
import type { OverlayController, OverlayRuntimeOptions, ProfileOverlayType } from "@/lib/overlays/types";

const DEFAULT_COLOR = "#ffffff";
const DEFAULT_SPACING = 10;

export class StaticTextureOverlayController implements OverlayController {
  private layer: HTMLDivElement | null = null;
  private opacity = 0.08;
  private color = DEFAULT_COLOR;
  private spacing = DEFAULT_SPACING;

  constructor(
    private readonly textureType: Extract<
      ProfileOverlayType,
      "diagonal-stripes" | "cyber-grid" | "dot-pattern"
    >,
    options?: OverlayRuntimeOptions,
  ) {
    if (options?.color) this.color = options.color;
    if (options?.spacing) this.spacing = options.spacing;
  }

  mount(container: HTMLElement): void {
    this.unmount();

    const layer = document.createElement("div");
    layer.setAttribute("aria-hidden", "true");
    Object.assign(layer.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      opacity: String(this.opacity),
      willChange: "opacity",
      transform: "translateZ(0)",
      backgroundRepeat: "repeat",
    });

    applyStaticTextureStyles(layer, this.textureType, this.color, this.spacing);
    container.appendChild(layer);
    this.layer = layer;
  }

  unmount(): void {
    this.layer?.remove();
    this.layer = null;
  }

  setOpacity(opacity: number): void {
    this.opacity = Math.min(1, Math.max(0, opacity));
    if (this.layer) this.layer.style.opacity = String(this.opacity);
  }

  setColor(color: string): void {
    this.color = color;
    if (this.layer) applyStaticTextureStyles(this.layer, this.textureType, this.color, this.spacing);
  }

  setSpacing(spacing: number): void {
    this.spacing = spacing;
    if (this.layer) applyStaticTextureStyles(this.layer, this.textureType, this.color, this.spacing);
  }
}
