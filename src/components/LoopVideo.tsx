import { useEffect, useRef, type VideoHTMLAttributes } from "react";

/** Reinicia um pouco antes do fim — evita o gap do atributo `loop` nativo. */
const DEFAULT_LOOP_LEAD_SEC = 0.15;

type Props = Omit<VideoHTMLAttributes<HTMLVideoElement>, "loop"> & {
  loopLeadSec?: number;
};

/**
 * Vídeo mudo com loop quase instantâneo (wallpaper / preview).
 * Não usa `loop` nativo — faz seek para o início antes do fim do arquivo.
 */
export function LoopVideo({
  loopLeadSec = DEFAULT_LOOP_LEAD_SEC,
  muted = true,
  playsInline = true,
  autoPlay = true,
  preload = "auto",
  src,
  onLoadedMetadata,
  ...rest
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const restart = () => {
      if (video.readyState >= 1) video.currentTime = 0.001;
      void video.play().catch(() => {});
    };

    const onTimeUpdate = () => {
      const { currentTime, duration } = video;
      if (!Number.isFinite(duration) || duration <= loopLeadSec) return;
      if (currentTime >= duration - loopLeadSec) restart();
    };

    const onVisibility = () => {
      if (!document.hidden) restart();
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", restart);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", restart);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loopLeadSec, src]);

  return (
    <video
      ref={ref}
      src={src}
      autoPlay={autoPlay}
      muted={muted}
      playsInline={playsInline}
      preload={preload}
      onLoadedMetadata={(e) => {
        void e.currentTarget.play().catch(() => {});
        onLoadedMetadata?.(e);
      }}
      {...rest}
    />
  );
}
