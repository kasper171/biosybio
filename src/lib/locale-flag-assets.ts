import { LOCALES, type Locale } from "@/i18n/types";

export const FLAG_IMAGE_BASE = "/onboarding/flags";

const FLAG_EXTENSIONS = ["png", "webp"] as const;

const resolvedSrc = new Map<Locale, string>();
const inflight = new Map<Locale, Promise<string | null>>();

export function getLocaleFlagCandidates(locale: Locale): string[] {
  return FLAG_EXTENSIONS.map((ext) => `${FLAG_IMAGE_BASE}/${locale}.${ext}`);
}

export function getLocaleFlagSrc(locale: Locale): string | null {
  return resolvedSrc.get(locale) ?? null;
}

function probeImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/** Resolve e cacheia a URL da bandeira (png → webp). */
export async function resolveLocaleFlagSrc(locale: Locale): Promise<string | null> {
  const cached = resolvedSrc.get(locale);
  if (cached) return cached;

  const pending = inflight.get(locale);
  if (pending) return pending;

  const task = (async () => {
    for (const url of getLocaleFlagCandidates(locale)) {
      if (await probeImage(url)) {
        resolvedSrc.set(locale, url);
        return url;
      }
    }
    return null;
  })();

  inflight.set(locale, task);
  try {
    return await task;
  } finally {
    inflight.delete(locale);
  }
}

/** Pré-carrega todas as bandeiras no cache do browser. */
export function preloadAllLocaleFlags(): void {
  for (const { id } of LOCALES) {
    void resolveLocaleFlagSrc(id);
  }
}
