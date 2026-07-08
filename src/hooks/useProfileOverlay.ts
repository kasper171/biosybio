import { useEffect, useRef } from "react";
import { createOverlayController } from "@/lib/overlays/overlay-registry";
import type { ProfileOverlayType } from "@/lib/overlays/types";
import type { OverlayController } from "@/lib/overlays/types";

const HOST_Z_INDEX = 9999;

/**
 * Monta overlay visual isolado em document.body (fora da árvore do perfil).
 * Cleanup garante remoção total — sem canvas fantasma.
 */
export function useProfileOverlay(activeType: ProfileOverlayType | null, cssOpacity: number): void {
  const controllerRef = useRef<OverlayController | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    controllerRef.current?.unmount();
    controllerRef.current = null;
    hostRef.current?.remove();
    hostRef.current = null;

    if (!activeType) return;

    const host = document.createElement("div");
    host.dataset.biosyOverlay = activeType;
    Object.assign(host.style, {
      position: "fixed",
      inset: "0",
      width: "100vw",
      height: "100vh",
      pointerEvents: "none",
      zIndex: String(HOST_Z_INDEX),
    });
    document.body.appendChild(host);
    hostRef.current = host;

    const controller = createOverlayController(activeType);
    controller.mount(host);
    controller.setOpacity(cssOpacity);
    controllerRef.current = controller;

    return () => {
      controller.unmount();
      host.remove();
      controllerRef.current = null;
      hostRef.current = null;
    };
  }, [activeType]);

  useEffect(() => {
    controllerRef.current?.setOpacity(cssOpacity);
  }, [cssOpacity]);
}
