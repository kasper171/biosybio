import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useI18n } from "@/i18n/LocaleProvider";
import { albumMessagesEn } from "@/features/album/i18n/album-messages.en";
import { albumMessagesPt } from "@/features/album/i18n/album-messages.pt";
import { albumMessagesEs } from "@/features/album/i18n/album-messages.es";

type AlbumMessages = typeof albumMessagesPt;

const AlbumI18nContext = createContext<{ t: (key: string) => string }>({
  t: (k) => k,
});

export function AlbumI18nProvider({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const messages: AlbumMessages =
    locale === "en" ? albumMessagesEn : locale === "es" ? albumMessagesEs : albumMessagesPt;

  const value = useMemo(
    () => ({
      t: (key: string) => {
        const parts = key.split(".");
        let cur: unknown = messages;
        for (const p of parts) {
          if (cur && typeof cur === "object" && p in cur) cur = (cur as Record<string, unknown>)[p];
          else return key;
        }
        return typeof cur === "string" ? cur : key;
      },
    }),
    [messages],
  );

  return <AlbumI18nContext.Provider value={value}>{children}</AlbumI18nContext.Provider>;
}

export function useAlbumI18n() {
  return useContext(AlbumI18nContext);
}
