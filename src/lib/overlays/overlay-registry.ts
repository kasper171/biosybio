import {
  DenseNoiseOverlayController,
  FilmGrainOverlayController,
  ScanlinesOverlayController,
  SparseNoiseOverlayController,
} from "@/lib/overlays/overlay-controllers";
import type { OverlayController, OverlayControllerFactory, ProfileOverlayType } from "@/lib/overlays/types";

export const OVERLAY_REGISTRY: Record<ProfileOverlayType, OverlayControllerFactory> = {
  "noise-denso": () => new DenseNoiseOverlayController(),
  "noise-esparso": () => new SparseNoiseOverlayController(),
  scanlines: () => new ScanlinesOverlayController(),
  "film-grain": () => new FilmGrainOverlayController(),
};

export const PROFILE_OVERLAY_TYPES = Object.keys(OVERLAY_REGISTRY) as ProfileOverlayType[];

export function createOverlayController(type: ProfileOverlayType): OverlayController {
  return OVERLAY_REGISTRY[type]();
}
