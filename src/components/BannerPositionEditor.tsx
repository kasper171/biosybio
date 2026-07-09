import { useRef, useState } from "react";
import { Move } from "lucide-react";
import { useViewportAspect } from "@/hooks/useViewportAspect";
import { useI18n } from "@/i18n/LocaleProvider";
import { isVideoMediaUrl } from "@/lib/media-url";

export type ImagePositionVariant = "banner" | "avatar" | "wallpaper";

type Props = {
  url: string;
  posX: number;
  posY: number;
  onChange: (x: number, y: number) => void;
  variant?: ImagePositionVariant;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function BannerPositionEditor({ url, posX, posY, onChange, variant = "banner" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const viewportAspect = useViewportAspect();
  const { t } = useI18n();

  const label =
    variant === "avatar"
      ? t("dashboard.midia.positionEditor.avatar")
      : variant === "wallpaper"
        ? t("dashboard.midia.positionEditor.wallpaper")
        : t("dashboard.midia.positionEditor.banner");

  const aspect =
    variant === "banner"
      ? "aspect-[3/1]"
      : variant === "avatar"
        ? "aspect-square max-w-[200px]"
        : "";
  const rounded = variant === "avatar" ? "rounded-full" : "rounded-lg";
  const frameStyle = variant === "wallpaper" ? { aspectRatio: viewportAspect } : undefined;
  const isVideo = isVideoMediaUrl(url);
  const mediaStyle = { objectPosition: `${posX}% ${posY}%` as const };

  const pick = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = clamp(((clientX - r.left) / r.width) * 100, 0, 100);
    const y = clamp(((clientY - r.top) / r.height) * 100, 0, 100);
    onChange(x, y);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-white/60">{label}</p>
        <span className="flex shrink-0 items-center gap-1 text-[10px] text-white/40">
          <Move className="h-3 w-3" /> {t("dashboard.midia.positionEditor.dragHint")}
        </span>
      </div>
      <div
        ref={ref}
        style={frameStyle}
        className={`relative w-full overflow-hidden border border-white/15 bg-black/40 select-none touch-none ${aspect} ${rounded} ${
          dragging ? "cursor-grabbing ring-2 ring-pink-500/50" : "cursor-grab"
        }`}
        onPointerDown={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          setDragging(true);
          pick(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          pick(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => {
          setDragging(false);
          (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => setDragging(false)}
      >
        {isVideo ? (
          <video
            src={url}
            autoPlay
            loop
            muted
            playsInline
            draggable={false}
            className="pointer-events-none h-full w-full object-cover"
            style={mediaStyle}
          />
        ) : (
          <img
            src={url}
            alt=""
            draggable={false}
            className="pointer-events-none h-full w-full object-cover"
            style={mediaStyle}
          />
        )}
        {variant === "banner" && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.35) 100%)",
            }}
          />
        )}
        {variant === "avatar" && (
          <div
            className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/25 ring-inset"
            aria-hidden
          />
        )}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 bg-pink-500/40 shadow" />
      </div>
      <p className="text-[10px] text-white/40">
        {t("dashboard.midia.positionEditor.focus", { x: Math.round(posX), y: Math.round(posY) })}
        {variant === "wallpaper" ? t("dashboard.midia.positionEditor.viewportHint") : ""}
      </p>
    </div>
  );
}
