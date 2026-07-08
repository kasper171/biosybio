import logoUrl from "@/assets/logo.png";
import { SITE_TITLE } from "@/lib/site";

/** Browsers typically display ~50–60 characters in the tab title. */
export const PAGE_TITLE_MAX = 60;

export const DEFAULT_SITE_FAVICON_URL =
  typeof logoUrl === "string" ? logoUrl : "/favicon.ico";

export type PageMetaSource = {
  page_title?: string | null;
  page_favicon_url?: string | null;
  /** Legacy fallback when page_title is empty (existing profiles). */
  share_embed_title?: string | null;
};

export function resolvePageTitle(source: PageMetaSource): string {
  const custom = source.page_title?.trim();
  if (custom) return custom.slice(0, PAGE_TITLE_MAX);
  const legacy = source.share_embed_title?.trim();
  if (legacy) return legacy.slice(0, PAGE_TITLE_MAX);
  return SITE_TITLE;
}

export function resolvePageFaviconUrl(pageFaviconUrl?: string | null): string {
  const custom = pageFaviconUrl?.trim();
  return custom || DEFAULT_SITE_FAVICON_URL;
}
