import { useEffect, useRef, useState, type RefObject } from "react";
import { createOverlayController } from "@/lib/overlays/overlay-registry";
import type { OverlayRuntimeOptions, ProfileOverlayType } from "@/lib/overlays/types";
import type { OverlayController } from "@/lib/overlays/types";

const HOST_Z_INDEX = 9999;

export type ProfileOverlayScope = "viewport" | "preview";

type Options = {
  scope?: ProfileOverlayScope;
  containerRef?: RefObject<HTMLElement | null>;
  runtime?: OverlayRuntimeOptions;
};

export function useProfileOverlay(
  activeType: ProfileOverlayType | null,
  cssOpacity: number,
  options?: Options,
): void {
  const controllerRef = useRef<OverlayController | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const scope = options?.scope ?? "viewport";
  const containerRef = options?.containerRef;
  const runtime = options?.runtime;
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (scope !== "preview") {
      setContainerEl(null);
      return;
    }
    setContainerEl(containerRef?.current ?? null);
  });

  useEffect(() => {
    controllerRef.current?.unmount();
    controllerRef.current = null;
    hostRef.current?.remove();
    hostRef.current = null;

    if (!activeType) return;
    if (scope === "preview" && !containerEl) return;

    const host = document.createElement("div");
    host.dataset.biosyOverlay = activeType;
    const isPreview = scope === "preview" && containerEl;
    Object.assign(host.style, {
      position: isPreview ? "absolute" : "fixed",
      inset: "0",
      width: isPreview ? "100%" : "100vw",
      height: isPreview ? "100%" : "100vh",
      pointerEvents: "none",
      zIndex: String(HOST_Z_INDEX),
      willChange: "opacity",
      transform: "translateZ(0)",
    });

    const mountTarget = isPreview ? containerEl! : document.body;
    mountTarget.appendChild(host);
    hostRef.current = host;

    const controller = createOverlayController(activeType, runtime);
    controller.mount(host);
    controller.setOpacity(cssOpacity);
    controllerRef.current = controller;

    return () => {
      controller.unmount();
      host.remove();
      controllerRef.current = null;
      hostRef.current = null;
    };
  }, [activeType, scope, containerEl, runtime?.color, runtime?.spacing]);

  useEffect(() => {
    controllerRef.current?.setOpacity(cssOpacity);
  }, [cssOpacity]);

  useEffect(() => {
    if (!runtime) return;
    controllerRef.current?.setColor?.(runtime.color);
    controllerRef.current?.setSpacing?.(runtime.spacing);
  }, [runtime?.color, runtime?.spacing]);
}
