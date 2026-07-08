import { Globe } from "lucide-react";
import { LOCALES } from "@/i18n/types";
import { useI18n } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  compact?: boolean;
};

export function LanguageSwitcher({ className, compact = false }: Props) {
  const { locale, setLocale } = useI18n();

  return (
    <div className={cn("relative", className)}>
      <label className="sr-only" htmlFor="site-language">
        Language
      </label>
      <div className="pointer-events-none absolute left-2.5 top-1/2 z-[1] -translate-y-1/2 text-white/45">
        <Globe className="h-3.5 w-3.5" aria-hidden />
      </div>
      <select
        id="site-language"
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        className={cn(
          "cursor-pointer appearance-none rounded-full border border-white/15 bg-white/5 py-2 pl-8 pr-8 text-xs font-medium text-white/85 outline-none transition hover:border-white/25 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-pink-500/40",
          compact ? "py-1.5" : "py-2",
        )}
        aria-label="Select language"
      >
        {LOCALES.map((item) => (
          <option key={item.id} value={item.id} className="bg-zinc-900 text-white">
            {compact ? item.short : item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
