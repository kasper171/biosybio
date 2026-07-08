import type { Profile } from "@/lib/profile-storage";
import { useProfileOverlay } from "@/hooks/useProfileOverlay";
import {
  overlayNoiseCssOpacity,
  resolveActiveProfileOverlay,
} from "@/lib/overlays/profile-overlays";

type Props = {
  profile: Profile;
};

/**
 * Camada visual de overlay — portal via DOM imperativo (useProfileOverlay).
 * Não altera layout, interação ou árvore React do perfil.
 */
export function ProfileOverlayLayer({ profile }: Props) {
  const activeType = resolveActiveProfileOverlay(profile);
  const cssOpacity = overlayNoiseCssOpacity(profile.overlay_noise_opacity);

  useProfileOverlay(activeType, cssOpacity);

  return null;
}
