import type { CSSProperties } from "react";

type Props = {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  style?: CSSProperties;
};

export const ShinyText = ({
  text,
  disabled = false,
  speed = 5,
  className = "",
  style,
}: Props) => {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`bg-clip-text inline-block ${disabled ? "" : "animate-shine"} ${className}`}
      style={{
        color: style?.color ?? "inherit",
        backgroundImage:
          "linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.65) 50%, rgba(255, 255, 255, 0) 60%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: style?.color ? undefined : "transparent",
        animationDuration,
        ...style,
      }}
    >
      {text}
    </span>
  );
};
