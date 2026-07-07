import type { CSSProperties } from "react";
import { motion } from "motion/react";

type Props = {
  text?: string;
  className?: string;
  style?: CSSProperties;
  charStyle?: CSSProperties;
};

export const StaggeredPopInText = ({
  text = "Pop!",
  className = "inline-flex flex-wrap",
  style,
  charStyle,
}: Props) => {
  return (
    <span className={className} style={style}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          custom={i}
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: i * 0.1, type: "spring", stiffness: 200, damping: 12 }}
          className="inline-block"
          style={charStyle}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
};
