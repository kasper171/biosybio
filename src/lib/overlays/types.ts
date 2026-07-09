/** Tipos de overlay de página — animados (canvas) e estáticos (CSS). */
export const PROFILE_OVERLAY_TYPES = [
  "noise-denso",
  "noise-esparso",
  "scanlines",
  "film-grain",
  "diagonal-stripes",
  "cyber-grid",
  "dot-pattern",
] as const;

export type ProfileOverlayType = (typeof PROFILE_OVERLAY_TYPES)[number];

export const STATIC_OVERLAY_TYPES: ReadonlySet<ProfileOverlayType> = new Set([
  "diagonal-stripes",
  "cyber-grid",
  "dot-pattern",
]);

export function isStaticOverlayType(type: ProfileOverlayType): boolean {
  return STATIC_OVERLAY_TYPES.has(type);
}

export type OverlayRuntimeOptions = {
  color: string;
  spacing: number;
};

export interface OverlayController {
  mount(container: HTMLElement): void;
  unmount(): void;
  setOpacity(opacity: number): void;
  setColor?(color: string): void;
  setSpacing?(spacing: number): void;
}

export type OverlayControllerFactory = (options?: OverlayRuntimeOptions) => OverlayController;
