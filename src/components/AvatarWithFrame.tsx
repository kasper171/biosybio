import type { CSSProperties, ReactNode } from "react";
import { AVATAR_FRAME_SCALE, getAvatarFrameUrl } from "@/lib/avatar-frames";
import { cn } from "@/lib/utils";

type Props = {
  size: number;
  frameId?: string | null;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/** Avatar circular + moldura APNG escalando junto com o tamanho do avatar */
export function AvatarWithFrame({ size, frameId, className, style, children }: Props) {
  const frameUrl = getAvatarFrameUrl(frameId);
  const frameSize = Math.round(size * AVATAR_FRAME_SCALE);

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size, ...style }}
    >
      {children}
      {frameUrl ? (
        <img
          src={frameUrl}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute left-1/2 top-1/2 z-[2] max-w-none select-none"
          style={{
            width: frameSize,
            height: frameSize,
            transform: "translate(-50%, -50%)",
          }}
        />
      ) : null}
    </div>
  );
}
