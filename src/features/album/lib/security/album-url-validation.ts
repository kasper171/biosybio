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

export function albumNormalizeSpotifyEmbedUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const host = normalizeHost(url.hostname);
    if (host === "open.spotify.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length >= 2 && ["track", "album", "playlist", "episode", "show"].includes(parts[0])) {
        return `https://open.spotify.com/embed/${parts[0]}/${parts[1]}${url.search}`;
      }
      return null;
    }
    if (host === "embed.spotify.com") {
      return trimmed.startsWith("http") ? trimmed : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function albumNormalizeMediaUrl(raw: string): string | null {
  if (!albumIsSafeExternalUrl(raw)) return null;
  return raw.trim();
}
