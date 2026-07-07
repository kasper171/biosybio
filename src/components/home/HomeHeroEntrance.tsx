import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type HomeHeroEntranceProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
};

export function HomeHeroEntrance({
  children,
  className,
  delay = 0,
  duration = 920,
}: HomeHeroEntranceProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReady(true);
      return;
    }

    const id = window.setTimeout(() => setReady(true), 40);
    return () => window.clearTimeout(id);
  }, []);

  const style = {
    "--entrance-delay": `${delay}ms`,
    "--entrance-duration": `${duration}ms`,
  } as CSSProperties;

  return (
    <div
      className={cn("home-hero-entrance", ready && "is-ready", className)}
      style={style}
    >
      {children}
    </div>
  );
}
