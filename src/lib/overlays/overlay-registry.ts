import { createNoiseOverlayController } from "@/lib/overlays/noise-overlay-controller";
import type { OverlayController, ProfileOverlayType } from "@/lib/overlays/types";

export function createOverlayController(type: ProfileOverlayType): OverlayController {
  switch (type) {
    case "noise":
      return createNoiseOverlayController();
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}
