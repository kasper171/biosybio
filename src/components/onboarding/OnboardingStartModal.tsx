import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOCALES, type Locale } from "@/i18n/types";
import { useI18n } from "@/i18n/LocaleProvider";
import { SITE_NAME } from "@/lib/site";
import { LocaleFlag } from "@/components/onboarding/LocaleFlag";

type Props = {
  open: boolean;
  onComplete: (locale: Locale) => void;
};

export function OnboardingStartModal({ open, onComplete }: Props) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<Locale | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) setSelected(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted || !open) return null;

  const handleContinue = () => {
    if (!selected) return;
    onComplete(selected);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-start-title"
    >
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-xl backdrop-saturate-150"
        aria-hidden
      />

      <div className="relative w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-pink-500/40 via-violet-500/25 to-cyan-400/30" />
        <div className="relative overflow-hidden rounded-[1.3rem] border border-white/10 bg-[#0f0f14]/95 shadow-2xl shadow-black/50">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-pink-500/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl"
            aria-hidden
          />

          <div className="relative px-6 pb-6 pt-7 sm:px-8 sm:pb-8 sm:pt-8">
            <div className="mb-5 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-pink-200">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Start
              </span>
            </div>

            <div className="text-center">
              <h2
                id="onboarding-start-title"
                className="text-xl font-bold tracking-tight text-white sm:text-2xl"
              >
                {t("onboarding.title", { siteName: SITE_NAME })}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-[15px]">
                {t("onboarding.languageQuestion")}
              </p>
              <p className="mt-1.5 text-xs text-white/40">{t("onboarding.languageHint")}</p>
            </div>

            <div
              className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3"
              role="radiogroup"
              aria-label={t("common.selectLanguage")}
            >
              {LOCALES.map((loc) => {
                const active = selected === loc.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelected(loc.id)}
                    className={cn(
                      "group flex flex-col items-center gap-3 rounded-2xl border px-4 py-5 text-center transition-all",
                      active
                        ? "border-pink-500/60 bg-pink-500/10 shadow-[0_0_0_1px_rgba(236,72,153,0.25)]"
                        : "border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-full p-0.5 transition-transform",
                        active ? "scale-105 ring-2 ring-pink-400/50 ring-offset-2 ring-offset-[#0f0f14]" : "group-hover:scale-[1.02]",
                      )}
                    >
                      <LocaleFlag locale={loc.id} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{loc.label}</p>
                      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-white/45">
                        {loc.short}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={!selected}
              onClick={handleContinue}
              className={cn(
                "mt-7 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                selected
                  ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg shadow-pink-500/20 hover:brightness-110"
                  : "cursor-not-allowed bg-white/10 text-white/35",
              )}
            >
              {t("onboarding.continue")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
