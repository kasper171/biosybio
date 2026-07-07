import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";

type Props = {
  words?: string[];
  text?: string;
  duration?: number;
  className?: string;
  style?: CSSProperties;
};

export const MorphingText = ({
  words,
  text,
  duration = 3000,
  className = "inline-block",
  style,
}: Props) => {
  const resolvedWords =
    words ??
    (text?.includes("|")
      ? text.split("|").map((w) => w.trim()).filter(Boolean)
      : text?.split(/\s+/).filter(Boolean)) ??
    ["Innovation", "Excellence", "Creativity", "Future", "Success"];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (resolvedWords.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % resolvedWords.length);
    }, duration);
    return () => clearInterval(interval);
  }, [resolvedWords.length, duration]);

  if (resolvedWords.length <= 1) {
    return (
      <span className={className} style={style}>
        {resolvedWords[0] ?? text ?? ""}
      </span>
    );
  }

  return (
    <span className={`relative ${className}`} style={style}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{
            opacity: 0,
            filter: "blur(10px)",
            scale: 0.8,
            rotateX: -90,
          }}
          animate={{
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
            rotateX: 0,
          }}
          exit={{
            opacity: 0,
            filter: "blur(10px)",
            scale: 1.2,
            rotateX: 90,
          }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            filter: { duration: 0.6 },
            scale: { duration: 0.6 },
            rotateX: { duration: 0.8 },
          }}
          className="inline-block"
          style={{ transformStyle: "preserve-3d", color: "inherit", font: "inherit" }}
        >
          {resolvedWords[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
