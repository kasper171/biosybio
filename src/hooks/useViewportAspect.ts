import { useEffect, useState } from "react";

/** Proporção largura/altura da viewport — usada para o editor de wallpaper bater com o site. */
export function useViewportAspect(): number {
  const [aspect, setAspect] = useState(() => readAspect());

  useEffect(() => {
    const update = () => setAspect(readAspect());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return aspect;
}

function readAspect(): number {
  if (typeof window === "undefined") return 16 / 9;
  const h = window.innerHeight || 1;
  return window.innerWidth / h;
}
