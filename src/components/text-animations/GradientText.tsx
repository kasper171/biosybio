import type { CSSProperties, ReactNode } from "react";

const gradientKeyframes = `
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animate-gradient {
  animation: gradient 8s linear infinite;
}
`;

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
};

export function GradientText({
  children,
  className = "",
  style,
  colors = ["#ffaa40", "#9c40ff", "#ffaa40"],
  animationSpeed = 8,
  showBorder = false,
}: Props) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    backgroundSize: "300% 100%",
    animation: `gradient ${animationSpeed}s linear infinite`,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: gradientKeyframes }} />
      <span
        className={`relative mx-auto inline-flex max-w-fit flex-row items-center justify-center rounded-[1.25rem] font-medium backdrop-blur transition-shadow duration-500 overflow-hidden ${className}`}
        style={style}
      >
        {showBorder && (
          <span className="absolute inset-0 bg-cover z-0 pointer-events-none" style={gradientStyle}>
            <span
              className="absolute inset-0 bg-black rounded-[1.25rem] z-[-1]"
              style={{
                width: "calc(100% - 2px)",
                height: "calc(100% - 2px)",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          </span>
        )}
        <span
          className="inline-block relative z-[2] text-transparent bg-cover"
          style={{
            ...gradientStyle,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
          }}
        >
          {children}
        </span>
      </span>
    </>
  );
}
