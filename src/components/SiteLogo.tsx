import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/logo.png";
import { SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  size?: number;
  className?: string;
  linked?: boolean;
};

export function SiteLogo({ size = 36, className, linked = true }: SiteLogoProps) {
  const content = (
    <>
      <img
        src={logoUrl}
        alt={SITE_NAME}
        width={size}
        height={size}
        style={{ filter: "drop-shadow(0 0 12px oklch(0.65 0.28 0 / 0.55))" }}
      />
      <span
        className={cn(
          "font-bold tracking-tight",
          size <= 28 ? "text-base sm:text-lg" : size <= 32 ? "text-lg" : "text-xl",
        )}
      >
        {SITE_NAME}
      </span>
    </>
  );

  if (!linked) {
    return <div className={cn("flex items-center gap-2", className)}>{content}</div>;
  }

  return (
    <Link to="/" className={cn("flex items-center gap-2", className)}>
      {content}
    </Link>
  );
}
