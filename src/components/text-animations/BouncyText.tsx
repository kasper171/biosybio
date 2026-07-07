import type { CSSProperties } from "react";
import { motion } from "motion/react";

type Props = {
  text?: string;
  className?: string;
  style?: CSSProperties;
  charStyle?: CSSProperties;
};

export const BouncyText = ({
  text = "Bouncy Animation",
  className = "inline-block",
  style,
  charStyle,
}: Props) => {
  return (
    <span className={className} style={style}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: 0 }}
          animate={{ y: [0, -20, 0] }}
          transition={{
            delay: i * 0.1,
            duration: 0.6,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut",
          }}
          className="inline-block"
          style={charStyle}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
};
