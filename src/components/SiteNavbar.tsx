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
    if (!el) return;

    const measure = () => setSpacerHeight(el.offsetHeight);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scrolled]);

  return (
    <>
      <div style={{ height: spacerHeight }} aria-hidden className="pointer-events-none" />
      <header
        ref={headerRef}
        data-scrolled={scrolled ? "" : undefined}
        className="site-navbar"
      >
        <SiteLogo
          size={scrolled ? 28 : 36}
          className="site-navbar__logo shrink-0"
        />
        {children ? (
          <nav className="site-navbar__links hidden items-center text-sm text-white/70 lg:flex">
            {children}
          </nav>
        ) : null}
        <SiteAuthButtons className="site-navbar__actions" />
      </header>
    </>
  );
}
