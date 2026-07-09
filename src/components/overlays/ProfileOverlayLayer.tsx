import type { RefObject } from "react";
import type { Profile } from "@/lib/profile-storage";
import { useProfileOverlay } from "@/hooks/useProfileOverlay";
import {
  getOverlayRuntimeOptions,
  overlayCssOpacity,
  resolveActiveProfileOverlay,
} from "@/lib/overlays/profile-overlays";

type Props = {
  profile: Profile;
  /** No studio, limita o overlay à área do preview (não navbar/ferramentas). */
  isEditor?: boolean;
  containerRef?: RefObject<HTMLElement | null>;
};

/**
 * Camada visual de overlay — montagem imperativa isolada do conteúdo do perfil.
 */
export function ProfileOverlayLayer({ profile, isEditor, containerRef }: Props) {
  const activeType = resolveActiveProfileOverlay(profile);
  const cssOpacity = overlayCssOpacity(profile.overlay_opacity);
  const runtime = getOverlayRuntimeOptions(profile);

  useProfileOverlay(activeType, cssOpacity, {
    scope: isEditor ? "preview" : "viewport",
    containerRef: isEditor ? containerRef : undefined,
    runtime,
  });

  return null;
}
