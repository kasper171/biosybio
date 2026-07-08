import { useEffect, useRef } from "react";
import type { ProfileOverlayType } from "@/lib/overlays/types";
import {
  drawDenseNoise,
  drawGrain,
  drawScanlines,
  drawSparse,
  scanlineOffsetFromTime,
} from "@/lib/overlays/overlay-draw";
import { cn } from "@/lib/utils";

const PREVIEW_SIZE = 72;
const PREVIEW_INTERVAL_MS = 80;

function renderPreviewFrame(
  ctx: CanvasRenderingContext2D,
  type: ProfileOverlayType,
  size: number,
  timestamp: number,
): void {
  switch (type) {
    case "noise-denso":
      drawDenseNoise(ctx, size, size);
      break;
    case "noise-esparso":
      drawSparse(ctx, size, size, 0.04);
      break;
    case "scanlines":
      drawScanlines(ctx, size, size, scanlineOffsetFromTime(timestamp));
      break;
    case "film-grain":
      drawGrain(ctx, size, size, 0.08);
      break;
  }
}

type PreviewProps = {
  type: ProfileOverlayType;
  className?: string;
  opacity?: number;
};

export function OverlayPreviewCanvas({ type, className, opacity = 0.35 }: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    canvas.width = PREVIEW_SIZE;
    canvas.height = PREVIEW_SIZE;

    const tick = (timestamp: number) => {
      if (timestamp - lastFrameRef.current >= PREVIEW_INTERVAL_MS) {
        renderPreviewFrame(ctx, type, PREVIEW_SIZE, timestamp);
        lastFrameRef.current = timestamp;
      }
      rafRef.current = window.requestAnimationFrame(tick);
    };

    renderPreviewFrame(ctx, type, PREVIEW_SIZE, performance.now());
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("block h-[72px] w-[72px] rounded-md bg-black/40", className)}
      style={{ opacity }}
    />
  );
}

type PickerProps = {
  activeType: ProfileOverlayType | null;
  onSelect: (type: ProfileOverlayType | null) => void;
  labels: Record<ProfileOverlayType, string>;
};

export function OverlayTypePicker({ activeType, onSelect, labels }: PickerProps) {
  const types: ProfileOverlayType[] = [
    "noise-denso",
    "noise-esparso",
    "scanlines",
    "film-grain",
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {types.map((type) => {
        const selected = activeType === type;
        return (
          <button
            key={type}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(selected ? null : type)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border px-2 py-2.5 transition",
              selected
                ? "border-pink-500/70 bg-pink-500/10 ring-1 ring-pink-500/40"
                : "border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
            )}
          >
            <OverlayPreviewCanvas type={type} />
            <span
              className={cn(
                "max-w-full truncate text-center text-[10px] font-medium leading-tight",
                selected ? "text-white/90" : "text-white/55",
              )}
            >
              {labels[type]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
