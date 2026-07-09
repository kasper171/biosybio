import {
  DenseNoiseOverlayController,
  ScanlinesOverlayController,
  SparseNoiseOverlayController,
} from "@/lib/overlays/overlay-controllers";
import { StaticTextureOverlayController } from "@/lib/overlays/static-texture-overlay-controller";
import type { OverlayController, OverlayControllerFactory, ProfileOverlayType } from "@/lib/overlays/types";

export const OVERLAY_REGISTRY: Record<ProfileOverlayType, OverlayControllerFactory> = {
  "noise-denso": (opts) => new DenseNoiseOverlayController(opts),
  "noise-esparso": (opts) => new SparseNoiseOverlayController(opts),
  scanlines: (opts) => new ScanlinesOverlayController(opts),
  "diagonal-stripes": (opts) => new StaticTextureOverlayController("diagonal-stripes", opts),
  "cyber-grid": (opts) => new StaticTextureOverlayController("cyber-grid", opts),
  "dot-pattern": (opts) => new StaticTextureOverlayController("dot-pattern", opts),
};

export function createOverlayController(
  type: ProfileOverlayType,
  options?: Parameters<OverlayControllerFactory>[0],
): OverlayController {
  return OVERLAY_REGISTRY[type](options);
}
