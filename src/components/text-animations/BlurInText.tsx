import type { CSSProperties } from "react";
import { motion } from "motion/react";

type Props = {
  text?: string;
  className?: string;
  style?: CSSProperties;
  charStyle?: CSSProperties;
};

export const BlurInText = ({
  text = "Blur In Effect",
  className = "inline-block",
  style,
  charStyle,
}: Props) => {
  return (
    <span className={className} style={style}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{
            opacity: 0,
            filter: "blur(10px)",
          }}
          animate={{
            opacity: 1,
            filter: "blur(0px)",
          }}
          transition={{
            delay: i * 0.05,
            duration: 0.8,
            ease: "easeOut",
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
