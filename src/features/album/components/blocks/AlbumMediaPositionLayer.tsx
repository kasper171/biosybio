import { useRef, useState } from "react";
import { Move } from "lucide-react";

type Props = {
  url: string;
  kind: "image" | "video";
  posX: number;
  posY: number;
  objectFit?: "cover" | "contain";
  editable?: boolean;
  onChange?: (posX: number, posY: number) => void;
};

function clamp(n: number) {
  return Math.min(100, Math.max(0, n));
}

export function AlbumMediaPositionLayer({
  url,
  kind,
  posX,
  posY,
  objectFit = "cover",
  editable = false,
  onChange,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const mediaStyle = { objectPosition: `${posX}% ${posY}%` as const, objectFit };

  const pick = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el || !editable || !onChange) return;
    const r = el.getBoundingClientRect();
    onChange(clamp(((clientX - r.left) / r.width) * 100), clamp(((clientY - r.top) / r.height) * 100));
  };

  const media =
    kind === "video" ? (
      <video
        src={url}
        className="pointer-events-none h-full w-full"
        style={mediaStyle}
        muted
        playsInline
        loop
        autoPlay
        draggable={false}
      />
    ) : (
      <img
        src={url}
        alt=""
        draggable={false}
        className="pointer-events-none h-full w-full"
        style={mediaStyle}
      />
    );

  return (
    <div
      ref={ref}
      className={`relative h-full w-full overflow-hidden ${editable ? (dragging ? "cursor-grabbing ring-2 ring-pink-500/40" : "cursor-grab") : ""}`}
      onPointerDown={(e) => {
        if (!editable || !onChange) return;
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        pick(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (!dragging) return;
        e.stopPropagation();
        pick(e.clientX, e.clientY);
      }}
      onPointerUp={(e) => {
        setDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={() => setDragging(false)}
    >
      {media}
      {editable ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/45 py-1 text-[9px] text-white/75">
          <Move className="h-3 w-3" />
          Arraste para ajustar o enquadramento
        </div>
      ) : null}
    </div>
  );
}
