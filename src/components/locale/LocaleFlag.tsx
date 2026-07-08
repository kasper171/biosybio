import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/types";
import {
  getLocaleFlagSrc,
  resolveLocaleFlagSrc,
} from "@/lib/locale-flag-assets";

export type LocaleFlagSize = "sm" | "md" | "lg";

type FlagProps = {
  locale: Locale;
  className?: string;
  size?: LocaleFlagSize;
};

const SIZE_CLASSES: Record<LocaleFlagSize, string> = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-14 w-14",
};

function FlagSvgFallback({ locale, className, size = "md" }: FlagProps) {
  const dim = SIZE_CLASSES[size];
  if (locale === "pt") {
    return (
      <svg viewBox="0 0 64 64" className={cn("h-full w-full", className)} aria-hidden>
        <circle cx="32" cy="32" r="32" fill="#009B3A" />
        <polygon points="32,6 58,32 32,58 6,32" fill="#FEDF00" />
        <circle cx="32" cy="32" r="11" fill="#002776" />
      </svg>
    );
  }
  if (locale === "es") {
    return (
      <svg viewBox="0 0 64 64" className={cn("h-full w-full", className)} aria-hidden>
        <circle cx="32" cy="32" r="32" fill="#AA151B" />
        <rect x="0" y="16" width="64" height="32" fill="#F1BF00" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className={cn("h-full w-full", className)} aria-hidden>
      <circle cx="32" cy="32" r="32" fill="#3C3B6E" />
      <rect x="0" y="0" width="64" height="14" fill="#B22234" />
      <rect x="0" y="28" width="64" height="14" fill="#B22234" />
    </svg>
  );
}

export function LocaleFlag({ locale, className, size = "md" }: FlagProps) {
  const [src, setSrc] = useState<string | null>(() => getLocaleFlagSrc(locale));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const cached = getLocaleFlagSrc(locale);
    if (cached) {
      setSrc(cached);
      setFailed(false);
      return;
    }

    void resolveLocaleFlagSrc(locale).then((url) => {
      if (!active) return;
      if (url) {
        setSrc(url);
        setFailed(false);
      } else {
        setFailed(true);
      }
    });

    return () => {
      active = false;
    };
  }, [locale]);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-inset ring-white/15",
        SIZE_CLASSES[size],
        className,
      )}
      aria-hidden
    >
      {failed || !src ? (
        <FlagSvgFallback locale={locale} size={size} />
      ) : (
        <img
          src={src}
          alt=""
          loading="eager"
          decoding="sync"
          fetchPriority="high"
          className="h-full w-full object-cover object-center scale-[1.22]"
        />
      )}
    </span>
  );
}
