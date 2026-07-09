import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getInitialLocale, writeStoredLocale } from "@/i18n/locale-storage";
import { interpolate, resolveMessage } from "@/i18n/resolve";
import { messages } from "@/i18n/messages";
import { DEFAULT_LOCALE, type Locale, type TranslateParams } from "@/i18n/types";
import { preloadAllLocaleFlags } from "@/lib/locale-flag-assets";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: TranslateParams) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeStoredLocale(next);
  }, []);

  useEffect(() => {
    setLocaleState(getInitialLocale());
  }, []);

  useEffect(() => {
    const lang = locale === "pt" ? "pt-BR" : locale === "es" ? "es" : "en";
    document.documentElement.lang = lang;
  }, [locale]);

  useEffect(() => {
    preloadAllLocaleFlags();
  }, []);

  const t = useCallback(
    (key: string, params?: TranslateParams) => {
      const tree = messages[locale];
      const raw = resolveMessage(tree, key) ?? resolveMessage(messages.en, key) ?? key;
      return interpolate(raw, params);
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LocaleProvider");
  return ctx;
}

/** For libs outside React tree — reads last known locale from storage on each call. */
export function translate(key: string, params?: TranslateParams): string {
  const locale = getInitialLocale();
  const raw =
    resolveMessage(messages[locale], key) ?? resolveMessage(messages.en, key) ?? key;
  return interpolate(raw, params);
}
