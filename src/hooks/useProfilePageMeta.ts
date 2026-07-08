import { useEffect, useMemo } from "react";
import type { Profile } from "@/lib/profile-storage";
import { resolvePageFaviconUrl, resolvePageTitle } from "@/lib/page-meta";

type ProfilePageMetaSource = Pick<
  Profile,
  "page_title" | "page_favicon_url" | "page_title_typing_effect" | "share_embed_title"
>;

const FAVICON_SELECTOR = 'link[data-biosy-favicon="true"]';

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
      document.title = "";
      return;
    }

    let index = 0;
    const timers: number[] = [];

    const restart = () => {
      index = 0;
      document.title = "";
      for (let i = 1; i <= fullTitle.length; i += 1) {
        const timer = window.setTimeout(() => {
          document.title = fullTitle.slice(0, i);
          if (i === fullTitle.length) {
            const pause = window.setTimeout(restart, 2200);
            timers.push(pause);
          }
        }, 72 * i);
        timers.push(timer);
      }
    };

    restart();

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      document.title = fullTitle;
    };
  }, [enabled, fullTitle, profile.page_title_typing_effect, animationSeed]);
}
