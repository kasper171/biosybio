import { imageObjectPosition } from "@/lib/image-position";
import { isVideoMediaUrl } from "@/lib/media-url";

type Props = {
  url: string | null | undefined;
  fallbackColor: string;
  posX?: number;
  posY?: number;
  blur?: number;
  brightness?: number;
  className?: string;
};

/**
 * Wallpaper em tela cheia — imagem ou vídeo mp4 (Premium).
 * Sempre fixed na viewport para a posição bater com o site ao vivo.
 */
export function ProfileWallpaperLayer({
  url,
  fallbackColor,
  posX = 50,
  posY = 50,
  blur = 0,
  brightness = 100,
  className = "",
}: Props) {
  const hasBlur = blur > 0;
  const objectPosition = imageObjectPosition(posX, posY);
  const isVideo = isVideoMediaUrl(url);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}
      style={{
        backgroundColor: url ? undefined : fallbackColor,
        filter: url ? `blur(${blur}px) brightness(${brightness}%)` : undefined,
        transform: hasBlur ? "scale(1.08)" : undefined,
      }}
    >
      {url ? (
        isVideo ? (
          <video
            src={url}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
            style={{ objectPosition }}
          />
        ) : (
          <img
            src={url}
            alt=""
            draggable={false}
            className="h-full w-full object-cover"
            style={{ objectPosition }}
          />
        )
      ) : null}
    </div>
  );
}
