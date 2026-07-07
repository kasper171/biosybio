import defaultShareImage from "@/assets/cta-banner.png";
import { SITE_ORIGIN } from "@/lib/site";

export const DEFAULT_SHARE_EMBED_TITLE = "Biosy — Your world. Your profile. Your way.";
export const DEFAULT_SHARE_EMBED_DESCRIPTION =
  "Create a unique profile with links, music, photo albums, cards, social networks, and more. All in one place.";

export const SHARE_EMBED_TITLE_MAX = 120;
export const SHARE_EMBED_DESCRIPTION_MAX = 300;

export type ShareEmbedSource = {
  share_embed_title?: string | null;
  share_embed_description?: string | null;
  share_embed_image_url?: string | null;
};

export function getDefaultShareEmbedImageUrl(): string {
  const path = typeof defaultShareImage === "string" ? defaultShareImage : "";
  if (!path) return `${SITE_ORIGIN}/og-default.png`;
  if (path.startsWith("http")) return path;
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export function resolveShareEmbedTitle(source: ShareEmbedSource): string {
  const custom = source.share_embed_title?.trim();
  return custom || DEFAULT_SHARE_EMBED_TITLE;
}

export function resolveShareEmbedDescription(source: ShareEmbedSource): string {
  const custom = source.share_embed_description?.trim();
  return custom || DEFAULT_SHARE_EMBED_DESCRIPTION;
}

export function resolveShareEmbedImageUrl(source: ShareEmbedSource): string {
  const custom = source.share_embed_image_url?.trim();
  return custom || getDefaultShareEmbedImageUrl();
}

export function buildProfileShareMeta(
  username: string,
  source: ShareEmbedSource,
): Array<
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }
> {
  const url = `${SITE_ORIGIN}/${username}`;
  const title = resolveShareEmbedTitle(source);
  const description = resolveShareEmbedDescription(source);
  const image = resolveShareEmbedImageUrl(source);

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
}
