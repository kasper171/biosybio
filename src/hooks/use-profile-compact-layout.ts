import { useEffect, useState } from "react";

/** Mesmo breakpoint do layout `lg:` do perfil público (hotel ao lado). */
export const PROFILE_COMPACT_LAYOUT_MAX_PX = 1023;

export function useProfileCompactLayout(): boolean {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${PROFILE_COMPACT_LAYOUT_MAX_PX}px)`);
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return compact;
}
