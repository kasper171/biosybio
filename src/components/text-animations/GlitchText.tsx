import type { CSSProperties, FC } from "react";

type Props = {
  children: string;
  speed?: number;
  enableShadows?: boolean;
  enableOnHover?: boolean;
  className?: string;
  style?: CSSProperties;
};

interface CustomCSSProperties extends CSSProperties {
  "--after-duration": string;
  "--before-duration": string;
  "--after-shadow": string;
  "--before-shadow": string;
}

const glitchStyles = `
.biosy-glitch {
  display: inline-block;
  position: relative;
  color: #fff;
  font: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  white-space: inherit;
  user-select: none;
}

.biosy-glitch::after,
.biosy-glitch::before {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: #fff;
  font: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  background-color: #060010;
  overflow: hidden;
  clip-path: inset(0 0 0 0);
  pointer-events: none;
}

.biosy-glitch:not(.enable-on-hover)::after {
  left: 2px;
  text-shadow: var(--after-shadow, -5px 0 red);
  animation: biosy-animate-glitch var(--after-duration, 3s) infinite linear alternate-reverse;
}
.biosy-glitch:not(.enable-on-hover)::before {
  left: -2px;
  text-shadow: var(--before-shadow, 5px 0 cyan);
  animation: biosy-animate-glitch var(--before-duration, 2s) infinite linear alternate-reverse;
}

.biosy-glitch.enable-on-hover::after,
.biosy-glitch.enable-on-hover::before {
  content: '';
  opacity: 0;
  animation: none;
}

.biosy-glitch.enable-on-hover:hover::after {
  content: attr(data-text);
  opacity: 1;
  left: 2px;
  text-shadow: var(--after-shadow, -5px 0 red);
  animation: biosy-animate-glitch var(--after-duration, 3s) infinite linear alternate-reverse;
}
.biosy-glitch.enable-on-hover:hover::before {
  content: attr(data-text);
  opacity: 1;
  left: -2px;
  text-shadow: var(--before-shadow, 5px 0 cyan);
  animation: biosy-animate-glitch var(--before-duration, 2s) infinite linear alternate-reverse;
}

@keyframes biosy-animate-glitch {
  0%   { clip-path: inset(20% 0 50% 0); }
  5%   { clip-path: inset(10% 0 60% 0); }
  10%  { clip-path: inset(15% 0 55% 0); }
  15%  { clip-path: inset(25% 0 35% 0); }
  20%  { clip-path: inset(30% 0 40% 0); }
  25%  { clip-path: inset(40% 0 20% 0); }
  30%  { clip-path: inset(10% 0 60% 0); }
  35%  { clip-path: inset(15% 0 55% 0); }
  40%  { clip-path: inset(25% 0 35% 0); }
  45%  { clip-path: inset(30% 0 40% 0); }
  50%  { clip-path: inset(20% 0 50% 0); }
  55%  { clip-path: inset(10% 0 60% 0); }
  60%  { clip-path: inset(15% 0 55% 0); }
  65%  { clip-path: inset(25% 0 35% 0); }
  70%  { clip-path: inset(30% 0 40% 0); }
  75%  { clip-path: inset(40% 0 20% 0); }
  80%  { clip-path: inset(20% 0 50% 0); }
  85%  { clip-path: inset(10% 0 60% 0); }
  90%  { clip-path: inset(15% 0 55% 0); }
  95%  { clip-path: inset(25% 0 35% 0); }
  100% { clip-path: inset(30% 0 40% 0); }
}
`;

export const GlitchText: FC<Props> = ({
  children,
  speed = 0.5,
  enableShadows = true,
  enableOnHover = false,
  className = "",
  style,
}) => {
  const inlineStyles: CustomCSSProperties = {
    "--after-duration": `${speed * 3}s`,
    "--before-duration": `${speed * 2}s`,
    "--after-shadow": enableShadows ? "-5px 0 red" : "none",
    "--before-shadow": enableShadows ? "5px 0 cyan" : "none",
    font: style?.font,
    lineHeight: style?.lineHeight,
    letterSpacing: style?.letterSpacing,
  };

  const hoverClass = enableOnHover ? "enable-on-hover" : "";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: glitchStyles }} />
      <span
        className={`biosy-glitch ${hoverClass} ${className}`}
        style={inlineStyles}
        data-text={children}
      >
        {children}
      </span>
    </>
  );
};
