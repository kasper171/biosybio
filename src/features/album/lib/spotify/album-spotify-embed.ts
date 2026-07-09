import { albumNormalizeSpotifyEmbedUrl, parseSpotifyPath } from "@/features/album/lib/security/album-url-validation";

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
  const parsed = parseSpotifyPath(raw);
  const embedUrl = albumNormalizeSpotifyEmbedUrl(raw);
  if (!parsed || !embedUrl) return null;

  const kind = parsed.kind;
  const compact = COMPACT_KINDS.has(kind);

  const finalUrl = (() => {
    try {
      const url = new URL(embedUrl);
      url.searchParams.set("utm_source", "generator");
      url.searchParams.set("theme", "0");
      return url.toString();
    } catch {
      return embedUrl;
    }
  })();

  return {
    embedUrl: finalUrl,
    kind,
    compact,
    suggestedGridH: compact ? 2 : 8,
    suggestedGridW: compact ? 4 : 4,
    iframeHeightPx: compact ? 80 : 352,
  };
}
