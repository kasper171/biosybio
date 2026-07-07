import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SiteAuthButtons } from "@/components/SiteAuthButtons";
import { SiteLogo } from "@/components/SiteLogo";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 28;

type SiteNavbarProps = {
  children?: ReactNode;
};

export function SiteNavbar({ children }: SiteNavbarProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [spacerHeight, setSpacerHeight] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el || scrolled) return;

    const measure = () => setSpacerHeight(el.offsetHeight);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scrolled]);

  return (
    <>
      {scrolled ? (
        <div style={{ height: spacerHeight }} aria-hidden className="pointer-events-none" />
      ) : null}
      <header
        ref={headerRef}
        className={cn(
          "z-50 flex items-center justify-between transition-[width,padding,border-radius,background,box-shadow,transform] duration-300 ease-out",
          scrolled
            ? "site-navbar-bubble fixed top-3 left-1/2 w-[min(640px,calc(100%-1.25rem))] -translate-x-1/2 rounded-full border border-white/10 bg-[#0e0e11]/82 px-3.5 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:w-[min(720px,calc(100%-2rem))] sm:px-5 sm:py-2.5"
            : "relative mx-auto max-w-7xl px-6 py-5",
        )}
      >
        <SiteLogo
          size={scrolled ? 28 : 36}
          className="shrink-0 transition-all duration-300"
        />
        {children ? (
          <nav
            className={cn(
              "hidden items-center text-sm text-white/70 lg:flex",
              scrolled ? "gap-5" : "gap-8",
            )}
          >
            {children}
          </nav>
        ) : null}
        <SiteAuthButtons
          className={cn(scrolled && "[&_a]:px-4 [&_a]:py-2 [&_a]:text-xs [&_button]:px-4 [&_button]:py-2 [&_button]:text-xs")}
        />
      </header>
    </>
  );
}
