import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/types";

export type LocaleFlagSize = "sm" | "md" | "lg";

type FlagProps = {
  locale: Locale;
  className?: string;
  size?: LocaleFlagSize;
};

const FLAG_IMAGE_BASE = "/onboarding/flags";

const SIZE_CLASSES: Record<LocaleFlagSize, string> = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-14 w-14",
};

function flagImageCandidates(locale: Locale): string[] {
  return [`${FLAG_IMAGE_BASE}/${locale}.webp`, `${FLAG_IMAGE_BASE}/${locale}.png`];
}

function FlagSvgFallback({ locale, className, size = "md" }: FlagProps) {
  const dim = SIZE_CLASSES[size];
  if (locale === "pt") {
    return (
      <svg viewBox="0 0 64 64" className={cn("shrink-0", dim, className)} aria-hidden>
        <circle cx="32" cy="32" r="32" fill="#009B3A" />
        <polygon points="32,6 58,32 32,58 6,32" fill="#FEDF00" />
        <circle cx="32" cy="32" r="11" fill="#002776" />
      </svg>
    );
  }
  if (locale === "es") {
    return (
      <svg viewBox="0 0 64 64" className={cn("shrink-0", dim, className)} aria-hidden>
        <circle cx="32" cy="32" r="32" fill="#AA151B" />
        <rect x="0" y="16" width="64" height="32" fill="#F1BF00" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className={cn("shrink-0", dim, className)} aria-hidden>
      <circle cx="32" cy="32" r="32" fill="#3C3B6E" />
      <rect x="0" y="0" width="64" height="14" fill="#B22234" />
      <rect x="0" y="28" width="64" height="14" fill="#B22234" />
    </svg>
  );
}

export function LocaleFlag({ locale, className, size = "md" }: FlagProps) {
  const candidates = flagImageCandidates(locale);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [useFallback, setUseFallback] = useState(false);

  if (useFallback || candidateIndex >= candidates.length) {
    return <FlagSvgFallback locale={locale} className={className} size={size} />;
  }

  return (
    <img
      src={candidates[candidateIndex]}
      alt=""
      className={cn(
        "shrink-0 rounded-full border border-white/20 object-cover shadow-sm",
        SIZE_CLASSES[size],
        className,
      )}
      onError={() => {
        if (candidateIndex + 1 < candidates.length) {
          setCandidateIndex((i) => i + 1);
        } else {
          setUseFallback(true);
        }
      }}
    />
  );
}
