const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
  "metadata.google.internal",
]);

const TRUSTED_EMBED_HOSTS = new Set([
  "open.spotify.com",
  "embed.spotify.com",
  "www.youtube.com",
  "youtube.com",
  "youtu.be",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
  "vimeo.com",
]);

const SPOTIFY_KINDS = ["track", "album", "playlist", "episode", "show"] as const;
type SpotifyKind = (typeof SPOTIFY_KINDS)[number];

function isPrivateIpv4(host: string): boolean {
  const parts = host.split(".").map((p) => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
  if (parts[0] === 10) return true;
  if (parts[0] === 127) return true;
  if (parts[0] === 0) return true;
  if (parts[0] === 169 && parts[1] === 254) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  return false;
}

function normalizeHost(hostname: string): string {
  return hostname.toLowerCase().replace(/\.$/, "");
}

export function albumIsSafeExternalUrl(
  raw: string,
  options?: { allowEmbedHostsOnly?: boolean },
): boolean {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const host = normalizeHost(url.hostname);
    if (BLOCKED_HOSTS.has(host)) return false;
    if (isPrivateIpv4(host)) return false;
    if (host.endsWith(".local") || host.endsWith(".internal")) return false;
    if (options?.allowEmbedHostsOnly) {
      return TRUSTED_EMBED_HOSTS.has(host);
    }
    return true;
  } catch {
    return false;
  }
}

export function parseSpotifyPath(raw: string): { kind: SpotifyKind; id: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const uriMatch = trimmed.match(/^spotify:(track|album|playlist|episode|show):([a-zA-Z0-9]+)/i);
  if (uriMatch) {
    return { kind: uriMatch[1].toLowerCase() as SpotifyKind, id: uriMatch[2] };
  }

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (!url.hostname.includes("spotify.com")) return null;
    const match = url.pathname.match(/\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/i);
    if (!match) return null;
    const kind = match[1].toLowerCase() as SpotifyKind;
    if (!SPOTIFY_KINDS.includes(kind)) return null;
    return { kind, id: match[2] };
  } catch {
    return null;
  }
}

export function albumNormalizeSpotifyEmbedUrl(raw: string): string | null {
  const parsed = parseSpotifyPath(raw);
  if (!parsed) return null;
  return `https://open.spotify.com/embed/${parsed.kind}/${parsed.id}`;
}

export function albumNormalizeMediaUrl(raw: string): string | null {
  if (!albumIsSafeExternalUrl(raw)) return null;
  return raw.trim();
}
