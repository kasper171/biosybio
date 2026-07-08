export type Locale = "en" | "pt" | "es";

export const LOCALES: { id: Locale; label: string; short: string }[] = [
  { id: "en", label: "English", short: "EN" },
  { id: "pt", label: "Português", short: "PT" },
  { id: "es", label: "Español", short: "ES" },
];

export const DEFAULT_LOCALE: Locale = "en";

export type MessageValue = string | MessageTree;
export type MessageTree = { [key: string]: MessageValue };

export type TranslateParams = Record<string, string | number | boolean | null | undefined>;
