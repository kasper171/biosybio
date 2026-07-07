import { useRef, useState } from "react";
import { Move } from "lucide-react";

type Props = {
  url: string;
  posX: number;
  posY: number;
  onChange: (x: number, y: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function BannerPositionEditor({ url, posX, posY, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

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
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-white/60">Posição do banner</p>
        <span className="flex items-center gap-1 text-[10px] text-white/40">
          <Move className="h-3 w-3" /> Arraste a imagem
        </span>
      </div>
      <div
        ref={ref}
        className={`relative aspect-[3/1] w-full overflow-hidden rounded-lg border border-white/15 bg-black/40 select-none touch-none ${
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
        <img
          src={url}
          alt=""
          draggable={false}
          className="pointer-events-none h-full w-full object-cover"
          style={{ objectPosition: `${posX}% ${posY}%` }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.35) 100%)",
          }}
        />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 bg-pink-500/40 shadow" />
      </div>
      <p className="text-[10px] text-white/40">
        Foco: {Math.round(posX)}% horizontal · {Math.round(posY)}% vertical
      </p>
    </div>
  );
}
