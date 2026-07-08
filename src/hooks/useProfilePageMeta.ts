import { useEffect, useMemo } from "react";
import type { Profile } from "@/lib/profile-storage";
import { resolvePageFaviconUrl, resolvePageTitle } from "@/lib/page-meta";

type ProfilePageMetaSource = Pick<
  Profile,
  "page_title" | "page_favicon_url" | "page_title_typing_effect" | "share_embed_title"
>;

const FAVICON_SELECTOR = 'link[data-biosy-favicon="true"]';

/** Velocidade média — legível sem ficar lento demais. */
const TAB_TITLE_TYPE_MS = 520;
const TAB_TITLE_DELETE_MS = 380;
const TAB_TITLE_HOLD_MS = 2600;

function ensureFaviconLink(): HTMLLinkElement {
  let link = document.querySelector<HTMLLinkElement>(FAVICON_SELECTOR);
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.setAttribute("data-biosy-favicon", "true");
    document.head.appendChild(link);
  }
  return link;
}

export function useProfilePageMeta(
  profile: ProfilePageMetaSource,
  options?: { enabled?: boolean; animationSeed?: number },
) {
  const enabled = options?.enabled !== false;
  const animationSeed = options?.animationSeed ?? 0;
  const fullTitle = useMemo(() => resolvePageTitle(profile), [profile]);
  const faviconHref = useMemo(
    () => resolvePageFaviconUrl(profile.page_favicon_url),
    [profile.page_favicon_url],
  );

  useEffect(() => {
    if (!enabled) return;
    const link = ensureFaviconLink();
    link.href = faviconHref;
    return () => {
      link.href = resolvePageFaviconUrl(null);
    };
  }, [enabled, faviconHref]);

  useEffect(() => {
    if (!enabled) return;

    if (!profile.page_title_typing_effect) {
      document.title = fullTitle;
      return;
    }

    if (!fullTitle) {
      document.title = fullTitle;
      return;
    }

    let cancelled = false;
    const timers: number[] = [];

    const schedule = (fn: () => void, delayMs: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn();
      }, delayMs);
      timers.push(id);
    };

    const setTitleSafe = (text: string) => {
      // Nunca deixar vazio — o navegador mostra a URL (ex.: byosy.bio/user) na aba.
      document.title = text.length > 0 ? text : fullTitle.slice(0, 1);
    };

    const typeForward = (nextLen: number) => {
      if (cancelled) return;

      if (nextLen > fullTitle.length) {
        if (fullTitle.length <= 1) {
          schedule(() => typeForward(1), TAB_TITLE_HOLD_MS);
          return;
        }
        schedule(() => deleteBackward(fullTitle.length - 1), TAB_TITLE_HOLD_MS);
        return;
      }

      setTitleSafe(fullTitle.slice(0, nextLen));
      schedule(() => typeForward(nextLen + 1), TAB_TITLE_TYPE_MS);
    };

    const deleteBackward = (len: number) => {
      if (cancelled) return;

      if (len <= 1) {
        setTitleSafe(fullTitle.slice(0, 1));
        schedule(() => typeForward(2), TAB_TITLE_TYPE_MS);
        return;
      }

      setTitleSafe(fullTitle.slice(0, len));
      schedule(() => deleteBackward(len - 1), TAB_TITLE_DELETE_MS);
    };

    setTitleSafe(fullTitle.slice(0, 1));
    schedule(() => typeForward(2), TAB_TITLE_TYPE_MS);

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
      document.title = fullTitle;
    };
  }, [enabled, fullTitle, profile.page_title_typing_effect, animationSeed]);
}
