import { Check, ChevronDown } from "lucide-react";
import { LOCALES, type Locale } from "@/i18n/types";
import { useI18n } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { LocaleFlag } from "@/components/locale/LocaleFlag";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  className?: string;
  /** Trigger menor (navbar). */
  compact?: boolean;
  /** Largura total (sidebar do dashboard). */
  fullWidth?: boolean;
};

export function LanguageSwitcher({ className, compact = false, fullWidth = false }: Props) {
  const { locale, setLocale, t } = useI18n();
  const current = LOCALES.find((item) => item.id === locale) ?? LOCALES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex items-center gap-2.5 rounded-xl border border-white/12 bg-white/[0.04] text-left text-white/90 outline-none transition",
            "hover:border-white/22 hover:bg-white/[0.07] focus-visible:ring-2 focus-visible:ring-pink-500/35",
            compact ? "px-2.5 py-1.5" : "px-3 py-2.5",
            fullWidth && "w-full",
            className,
          )}
          aria-label={t("common.selectLanguage")}
        >
          <LocaleFlag locale={locale} size={compact ? "sm" : "md"} />
          <span
            className={cn(
              "min-w-0 flex-1 truncate font-medium text-white/90",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {compact ? current.short : current.label}
          </span>
          <ChevronDown
            className={cn(
              "shrink-0 text-white/40 transition group-data-[state=open]:rotate-180",
              compact ? "h-3.5 w-3.5" : "h-4 w-4",
            )}
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={fullWidth ? "start" : "end"}
        sideOffset={8}
        className="z-[120] min-w-[13.5rem] border border-white/10 bg-[#12121a]/95 p-1.5 text-white shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        <DropdownMenuLabel className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
          {t("common.language")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => setLocale(value as Locale)}
        >
          {LOCALES.map((item) => {
            const active = item.id === locale;
            return (
              <DropdownMenuRadioItem
                key={item.id}
                value={item.id}
                className={cn(
                  "cursor-pointer gap-3 rounded-lg py-2.5 pl-2.5 pr-3 text-white outline-none",
                  "focus:bg-white/10 focus:text-white data-[highlighted]:bg-white/10",
                  active && "bg-pink-500/10",
                  "[&>span:first-child]:hidden",
                )}
              >
                <LocaleFlag locale={item.id} size="md" />
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-[11px] text-white/45">{item.short}</span>
                </div>
                {active ? (
                  <Check className="h-4 w-4 shrink-0 text-pink-400" aria-hidden />
                ) : (
                  <span className="h-4 w-4 shrink-0" aria-hidden />
                )}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
