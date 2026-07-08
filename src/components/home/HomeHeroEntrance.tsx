import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  ENTRANCE_EASE,
  ENTRANCE_VARIANTS,
  type EntranceVariant,
} from "@/components/home/home-entrance-motion";

type EntranceElement = "div" | "span";

type HomeHeroEntranceProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  variant?: EntranceVariant;
  as?: EntranceElement;
};

const MOTION_TAG = {
  div: motion.div,
  span: motion.span,
} as const;

export function HomeHeroEntrance({
  children,
  className,
  delay = 0,
  duration = 920,
  variant = "up",
  as: Tag = "div",
}: HomeHeroEntranceProps) {
  const Component = MOTION_TAG[Tag];

  const style = {
    willChange: "transform, opacity, filter",
  } as CSSProperties;

  return (
    <Component
      className={cn("home-hero-entrance", className)}
      style={style}
      initial="hidden"
      animate="visible"
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
