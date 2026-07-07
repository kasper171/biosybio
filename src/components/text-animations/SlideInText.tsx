import type { CSSProperties } from "react";
import { motion } from "motion/react";

type Props = {
  text?: string;
  className?: string;
  style?: CSSProperties;
  charStyle?: CSSProperties;
};

export const SlideInText = ({
  text = "Simplicity is the ultimate sophistication.",
  className = "inline-block",
  style,
  charStyle,
}: Props) => {
  return (
    <span className={className} style={style}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.03, ease: "easeOut" }}
          className="inline-block"
          style={charStyle}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
};
