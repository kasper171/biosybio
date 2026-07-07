import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { motion } from "motion/react";

type Props = {
  text?: string;
  className?: string;
  style?: CSSProperties;
  particleCount?: number;
  particleColor?: string;
};

export const ParticleText = ({
  text = "PARTICLES",
  className = "inline-block",
  style,
  particleCount = 24,
  particleColor = "currentColor",
}: Props) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const resolvedParticleColor =
    particleColor === "currentColor" && style?.color
      ? String(style.color)
      : particleColor;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles: HTMLDivElement[] = [];
    const count = Math.min(particleCount, 30);

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.className = "absolute w-0.5 h-0.5 rounded-full pointer-events-none";
      particle.style.backgroundColor = resolvedParticleColor;
      particle.style.opacity = Math.random().toString();

      const x = Math.random() * Math.max(container.offsetWidth, 40);
      const y = Math.random() * Math.max(container.offsetHeight, 20);
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      container.appendChild(particle);
      particles.push(particle);
    }

    let frame = 0;
    const animateParticles = () => {
      particles.forEach((particle, index) => {
        const time = Date.now() * 0.001 + index;
        const x = Math.sin(time * 0.5) * 8 + Math.cos(time * 0.3) * 12;
        const y = Math.cos(time * 0.4) * 6 + Math.sin(time * 0.6) * 10;

        particle.style.transform = `translate(${x}px, ${y}px)`;
        particle.style.opacity = (Math.sin(time * 2) * 0.5 + 0.5).toString();
      });

      frame = requestAnimationFrame(animateParticles);
    };

    animateParticles();

    return () => {
      cancelAnimationFrame(frame);
      particles.forEach((particle) => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
    };
  }, [particleCount, resolvedParticleColor]);

  return (
    <span ref={containerRef} className={`relative ${className}`} style={style}>
      <motion.span
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 inline-block"
        style={{
          color: "inherit",
          font: "inherit",
          textShadow: `0 0 12px ${resolvedParticleColor}55`,
        }}
      >
        {text}
      </motion.span>
    </span>
  );
};
