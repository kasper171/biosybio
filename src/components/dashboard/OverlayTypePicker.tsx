import { useEffect, useRef } from "react";
import {
  PROFILE_OVERLAY_TYPES,
  isStaticOverlayType,
  type ProfileOverlayType,
} from "@/lib/overlays/types";
import { DenseNoiseFrameCycler, SparseNoiseFrameCycler } from "@/lib/overlays/noise-frame-cache";
import { applyStaticTextureStyles } from "@/lib/overlays/static-texture-styles";
import { drawScanlines, scanlineOffsetFromTime } from "@/lib/overlays/overlay-draw";
import {
  OVERLAY_COLOR_DEFAULT,
  OVERLAY_SPACING_DEFAULT,
} from "@/lib/overlays/profile-overlays";
import { cn } from "@/lib/utils";

const PREVIEW_SIZE = 72;
const PREVIEW_INTERVAL_MS = 120;

type NoiseCyclers = {
  dense: DenseNoiseFrameCycler;
  sparse: SparseNoiseFrameCycler;
};

function renderAnimatedPreview(
  ctx: CanvasRenderingContext2D,
  type: ProfileOverlayType,
  size: number,
  timestamp: number,
  color: string,
  cyclers: NoiseCyclers,
): void {
  switch (type) {
    case "noise-denso":
      cyclers.dense.draw(ctx, size, size);
      break;
    case "noise-esparso":
      cyclers.sparse.draw(ctx, size, size);
      break;
    case "scanlines":
      drawScanlines(ctx, size, size, scanlineOffsetFromTime(timestamp), color);
      break;
    default:
      break;
  }
}

function StaticPreview({
  type,
  color = OVERLAY_COLOR_DEFAULT,
  spacing = OVERLAY_SPACING_DEFAULT,
}: {
  type: ProfileOverlayType;
  color?: string;
  spacing?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isStaticOverlayType(type)) return;
    applyStaticTextureStyles(el, type, color, spacing);
  }, [type, color, spacing]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="h-[72px] w-[72px] shrink-0 rounded-md bg-black/40"
      style={{ opacity: 0.55 }}
    />
  );
}

type PreviewProps = {
  type: ProfileOverlayType;
  className?: string;
  opacity?: number;
  color?: string;
  spacing?: number;
};

export function OverlayPreviewCanvas({
  type,
  className,
  opacity = 0.35,
  color = OVERLAY_COLOR_DEFAULT,
  spacing,
}: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const cyclersRef = useRef<NoiseCyclers>({
    dense: new DenseNoiseFrameCycler(),
    sparse: new SparseNoiseFrameCycler(),
  });

  useEffect(() => {
    if (isStaticOverlayType(type)) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true } as CanvasRenderingContext2DSettings);
    if (!ctx) return;

    canvas.width = PREVIEW_SIZE;
    canvas.height = PREVIEW_SIZE;
    cyclersRef.current.dense.reset();
    cyclersRef.current.sparse.reset();
    cyclersRef.current.dense.setColor(color);
    cyclersRef.current.sparse.setColor(color);

    const cyclers = cyclersRef.current;
    const isScanlines = type === "scanlines";

    const draw = (timestamp: number) => {
      renderAnimatedPreview(ctx, type, PREVIEW_SIZE, timestamp, color, cyclers);
    };

    draw(performance.now());

    if (isScanlines) {
      let lastFrame = 0;
      const tick = (timestamp: number) => {
        if (timestamp - lastFrame >= 50) {
          draw(timestamp);
          lastFrame = timestamp;
        }
        rafRef.current = window.requestAnimationFrame(tick);
      };
      rafRef.current = window.requestAnimationFrame(tick);
    } else {
      const tick = () => {
        draw(performance.now());
        timerRef.current = window.setTimeout(tick, PREVIEW_INTERVAL_MS);
      };
      timerRef.current = window.setTimeout(tick, PREVIEW_INTERVAL_MS);
    }

    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      cyclersRef.current.dense.reset();
      cyclersRef.current.sparse.reset();
    };
  }, [type, color]);

  if (isStaticOverlayType(type)) {
    return (
      <StaticPreview
        type={type}
        color={color}
        spacing={spacing}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("block h-[72px] w-[72px] rounded-md bg-black/40", className)}
      style={{ opacity, transform: "translateZ(0)" }}
    />
  );
}

type PickerProps = {
  activeType: ProfileOverlayType | null;
  onSelect: (type: ProfileOverlayType | null) => void;
  labels: Record<ProfileOverlayType, string>;
  previewColor?: string;
  previewSpacing?: number;
};

export function OverlayTypePicker({
  activeType,
  onSelect,
  labels,
  previewColor,
  previewSpacing,
}: PickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {PROFILE_OVERLAY_TYPES.map((type) => {
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
            <OverlayPreviewCanvas
              type={type}
              color={previewColor}
              spacing={previewSpacing}
            />
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
