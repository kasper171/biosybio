import { DEFAULT_LOCALE, type Locale } from "@/i18n/types";

const STORAGE_KEY = "byosy-locale";

export function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === "en" || raw === "pt" || raw === "es") return raw;
  return null;
}

export function writeStoredLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, locale);
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("pt")) return "pt";
  if (lang.startsWith("es")) return "es";
  return DEFAULT_LOCALE;
}

export function getInitialLocale(): Locale {
  return readStoredLocale() ?? detectBrowserLocale();
}
