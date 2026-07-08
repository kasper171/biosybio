import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";
import {
  ENTRANCE_EASE,
  ENTRANCE_VARIANTS,
  type EntranceVariant,
} from "@/components/home/home-entrance-motion";

type RevealElement = "div" | "span";

type HomeScrollRevealProps = {
  children: ReactNode;
  className?: string;
  variant?: EntranceVariant;
  delay?: number;
  duration?: number;
  as?: RevealElement;
};

const MOTION_TAG = {
  div: motion.div,
  span: motion.span,
} as const;

export function HomeScrollReveal({
  children,
  className,
  variant = "up",
  delay = 0,
  duration = 920,
  as: Tag = "div",
}: HomeScrollRevealProps) {
  const ref = useRef<HTMLDivElement | HTMLSpanElement>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.14,
    margin: "0px 0px -8% 0px",
  });

  const Component = MOTION_TAG[Tag];

  const style = {
    willChange: "transform, opacity, filter",
  } as CSSProperties;

  return (
    <Component
      ref={ref}
      className={cn("home-scroll-reveal", className)}
      style={style}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={ENTRANCE_VARIANTS[variant]}
      transition={{
        duration: duration / 1000,
        delay: delay / 1000,
        ease: ENTRANCE_EASE,
      }}
    >
      {children}
    </Component>
  );
}
