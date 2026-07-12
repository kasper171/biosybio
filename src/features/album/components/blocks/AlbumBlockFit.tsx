import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Escala o conteúdo (Discord, Habbo, etc.) para caber no bloco do grid
 * sem cortar — centraliza e ajusta up/down conforme o tamanho da célula.
 */
export function AlbumBlockFit({ children, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const host = hostRef.current;
    const measure = measureRef.current;
    if (!host || !measure) return;

    const fit = () => {
      const hw = host.clientWidth;
      const hh = host.clientHeight;
      const cw = measure.offsetWidth;
      const ch = measure.offsetHeight;
      if (hw <= 0 || hh <= 0 || cw <= 0 || ch <= 0) {
        setScale(1);
        return;
      }
      setScale(Math.min(hw / cw, hh / ch));
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);
    ro.observe(measure);

    const mo = new MutationObserver(fit);
    mo.observe(measure, { childList: true, subtree: true, attributes: true });

    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <div ref={hostRef} className={cn("album-block-fit", className)}>
      <div className="album-block-fit__stage" style={{ transform: `scale(${scale})` }}>
        <div ref={measureRef} className="album-block-fit__measure">
          {children}
        </div>
      </div>
    </div>
  );
}
