import type { ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/types";

type FlagProps = { className?: string };

function FlagCircle({ children, className }: { children: ReactNode; className?: string }) {
  const clipId = useId();
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-14 w-14 shrink-0", className)}
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>{children}</g>
      <circle
        cx="32"
        cy="32"
        r="31"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="2"
      />
    </svg>
  );
}

function FlagEn({ className }: FlagProps) {
  return (
    <FlagCircle className={className}>
      <rect width="64" height="64" fill="#B22234" />
      <rect y="9.23" width="64" height="4.92" fill="#fff" />
      <rect y="18.46" width="64" height="4.92" fill="#fff" />
      <rect y="27.69" width="64" height="4.92" fill="#fff" />
      <rect y="36.92" width="64" height="4.92" fill="#fff" />
      <rect y="46.15" width="64" height="4.92" fill="#fff" />
      <rect y="55.38" width="64" height="4.92" fill="#fff" />
      <rect width="28" height="28" fill="#3C3B6E" />
      <circle cx="7" cy="7" r="1.2" fill="#fff" />
      <circle cx="14" cy="7" r="1.2" fill="#fff" />
      <circle cx="21" cy="7" r="1.2" fill="#fff" />
      <circle cx="10.5" cy="12" r="1.2" fill="#fff" />
      <circle cx="17.5" cy="12" r="1.2" fill="#fff" />
      <circle cx="7" cy="17" r="1.2" fill="#fff" />
      <circle cx="14" cy="17" r="1.2" fill="#fff" />
      <circle cx="21" cy="17" r="1.2" fill="#fff" />
      <circle cx="10.5" cy="22" r="1.2" fill="#fff" />
      <circle cx="17.5" cy="22" r="1.2" fill="#fff" />
    </FlagCircle>
  );
}

function FlagPt({ className }: FlagProps) {
  return (
    <FlagCircle className={className}>
      <rect width="64" height="64" fill="#009B3A" />
      <polygon points="32,6 58,32 32,58 6,32" fill="#FEDF00" />
      <circle cx="32" cy="32" r="11" fill="#002776" />
      <path
        d="M22 32c0-5.5 4.5-10 10-10 2.2 0 4.2.7 5.8 1.9-1.4-3.8-5-6.5-9.3-6.5-5.5 0-10 4.5-10 10s4.5 10 10 10c4.3 0 7.9-2.7 9.3-6.5-1.6 1.2-3.6 1.9-5.8 1.9-5.5 0-10-4.5-10-10z"
        fill="#fff"
        opacity="0.95"
      />
    </FlagCircle>
  );
}

function FlagEs({ className }: FlagProps) {
  return (
    <FlagCircle className={className}>
      <rect width="64" height="64" fill="#AA151B" />
      <rect y="16" width="64" height="32" fill="#F1BF00" />
      <rect x="10" y="26" width="10" height="12" fill="#AA151B" opacity="0.85" />
    </FlagCircle>
  );
}

const FLAG_BY_LOCALE: Record<Locale, React.ComponentType<FlagProps>> = {
  en: FlagEn,
  pt: FlagPt,
  es: FlagEs,
};

export function LocaleFlag({ locale, className }: { locale: Locale; className?: string }) {
  const Flag = FLAG_BY_LOCALE[locale];
  return <Flag className={className} />;
}
