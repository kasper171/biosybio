import { albumNormalizeSpotifyEmbedUrl } from "@/features/album/lib/security/album-url-validation";

export type SpotifyEmbedKind = "track" | "album" | "playlist" | "episode" | "show";

export type SpotifyEmbedMeta = {
  embedUrl: string;
  kind: SpotifyEmbedKind;
  compact: boolean;
  suggestedGridH: number;
  suggestedGridW: number;
  iframeHeightPx: number;
};

const COMPACT_KINDS = new Set<SpotifyEmbedKind>(["track", "episode"]);

export function parseSpotifyEmbedMeta(raw: string): SpotifyEmbedMeta | null {
  const base = albumNormalizeSpotifyEmbedUrl(raw);
  if (!base) return null;

  let kind: SpotifyEmbedKind = "track";
  try {
    const url = new URL(base);
    const parts = url.pathname.split("/").filter(Boolean);
    const typePart = parts[1];
    if (
      typePart === "track" ||
      typePart === "album" ||
      typePart === "playlist" ||
      typePart === "episode" ||
      typePart === "show"
    ) {
      kind = typePart;
    }
  } catch {
    return null;
  }

  const compact = COMPACT_KINDS.has(kind);
  const embedUrl = (() => {
    try {
      const url = new URL(base);
      url.searchParams.set("utm_source", "generator");
      url.searchParams.set("theme", "0");
      return url.toString();
    } catch {
      return base;
    }
  })();

  return {
    embedUrl,
    kind,
    compact,
    suggestedGridH: compact ? 4 : 9,
    suggestedGridW: compact ? 4 : 4,
    iframeHeightPx: compact ? 80 : 352,
  };
}
