import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, MotionConfig } from "motion/react";
import { SiteAuthButtons } from "@/components/SiteAuthButtons";
import { SiteLogo } from "@/components/SiteLogo";
import { HomeHeroEntrance } from "@/components/home/HomeHeroEntrance";
import { ENTRANCE_EASE } from "@/components/home/home-entrance-motion";

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
    <MotionConfig reducedMotion="never">
      <div style={{ height: spacerHeight }} aria-hidden className="pointer-events-none" />
      <header
        ref={headerRef}
        data-scrolled={scrolled ? "" : undefined}
        className="site-navbar"
      >
        <motion.div
          className="site-navbar__inner"
          initial={{ opacity: 0, y: -24, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: ENTRANCE_EASE }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, delay: 0.05, ease: ENTRANCE_EASE }}
          >
            <SiteLogo
              size={scrolled ? 28 : 36}
              className="site-navbar__logo shrink-0"
            />
          </motion.div>

          {children ? (
            <nav className="site-navbar__links hidden items-center text-sm text-white/70 lg:flex">
              {Children.toArray(children).map((child, index) => (
                <HomeHeroEntrance
                  key={index}
                  as="span"
                  delay={140 + index * 70}
                  duration={800}
                  variant="up"
                  className="inline-flex"
                >
                  {child}
                </HomeHeroEntrance>
              ))}
            </nav>
          ) : null}

          <motion.div
            initial={{ opacity: 0, x: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, delay: 0.12, ease: ENTRANCE_EASE }}
          >
            <SiteAuthButtons className="site-navbar__actions" />
          </motion.div>
        </motion.div>
      </header>
    </MotionConfig>
  );
}
