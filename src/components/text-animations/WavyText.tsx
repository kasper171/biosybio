import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

type Props = {
  text?: string;
  className?: string;
  style?: CSSProperties;
  charStyle?: CSSProperties;
};

export const WavyText = ({
  text = "Wavy Motion",
  className = "inline-block",
  style,
  charStyle,
}: Props) => {
  const [animationTime, setAnimationTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationTime((prev) => prev + 0.1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={className} style={style}>
      {text.split("").map((char, i) => {
        const yOffset = Math.sin(animationTime + i * 0.3) * 10;
        return (
          <motion.span
            key={i}
            animate={{
              y: yOffset,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8,
              },
            }}
            className="inline-block"
            style={charStyle}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        );
      })}
    </span>
  );
};
