/** Tipos de overlay de página — extensível (VHS, glitch, partículas, etc.). */
export type ProfileOverlayType =
  | "noise-denso"
  | "noise-esparso"
  | "scanlines"
  | "film-grain";

export interface OverlayController {
  mount(container: HTMLElement): void;
  unmount(): void;
  setOpacity(opacity: number): void;
}

export type OverlayControllerFactory = () => OverlayController;
