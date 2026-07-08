import { imageObjectPosition } from "@/lib/image-position";

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
 * Wallpaper em tela cheia com object-fit: cover — igual no preview do dashboard e no perfil público.
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
        <img
          src={url}
          alt=""
          draggable={false}
          className="h-full w-full object-cover"
          style={{ objectPosition: imageObjectPosition(posX, posY) }}
        />
      ) : null}
    </div>
  );
}
