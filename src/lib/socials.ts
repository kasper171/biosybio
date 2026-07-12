import {
  FaInstagram, FaYoutube, FaTwitter, FaTwitch, FaSpotify, FaGithub,
  FaLinkedin, FaTiktok, FaDiscord, FaTelegram, FaWhatsapp, FaFacebook,
  FaGlobe, FaEnvelope, FaPinterest, FaSoundcloud, FaSteam, FaReddit,
  FaSnapchatGhost, FaTumblr,
} from "react-icons/fa";
import {
  SiKick, SiThreads, SiImgur, SiVsco, SiBehance, SiFlickr, SiDeviantart,
  SiArtstation, SiLinktree, SiKofi, SiPatreon,
} from "react-icons/si";
import type { IconType } from "react-icons";

export type SocialDef = {
  key: string;
  label: string;
  icon: IconType;
  brandColor: string;
  /** URL prefix shown before the input */
  prefix: string;
  /** Build full URL from the user-entered handle */
  build: (handle: string) => string;
  /** If handle expected to be a full URL instead of a handle */
  isFreeform?: boolean;
  placeholder: string;
};

export const SOCIALS: SocialDef[] = [
  { key: "instagram", label: "Instagram", icon: FaInstagram, brandColor: "#E1306C",
    prefix: "instagram.com/", placeholder: "yourname",
    build: (h) => `https://instagram.com/${h}` },
  { key: "tiktok", label: "TikTok", icon: FaTiktok, brandColor: "#000000",
    prefix: "tiktok.com/@", placeholder: "yourname",
    build: (h) => `https://tiktok.com/@${h}` },
  { key: "youtube", label: "YouTube", icon: FaYoutube, brandColor: "#FF0000",
    prefix: "youtube.com/", placeholder: "@canal, watch?v=... ou cole o link",
    build: (h) => buildYoutubeSocialUrl(h),
    isFreeform: true },
  { key: "twitter", label: "X / Twitter", icon: FaTwitter, brandColor: "#1DA1F2",
    prefix: "x.com/", placeholder: "yourname",
    build: (h) => `https://x.com/${h}` },
  { key: "threads", label: "Threads", icon: SiThreads, brandColor: "#000000",
    prefix: "threads.net/@", placeholder: "yourname",
    build: (h) => `https://threads.net/@${h}` },
  { key: "twitch", label: "Twitch", icon: FaTwitch, brandColor: "#9146FF",
    prefix: "twitch.tv/", placeholder: "yourchannel",
    build: (h) => `https://twitch.tv/${h}` },
  { key: "kick", label: "Kick", icon: SiKick, brandColor: "#53FC18",
    prefix: "kick.com/", placeholder: "yourchannel",
    build: (h) => `https://kick.com/${h}` },
  { key: "discord", label: "Discord", icon: FaDiscord, brandColor: "#5865F2",
    prefix: "discord.gg/", placeholder: "invite",
    build: (h) => `https://discord.gg/${h}` },
  { key: "spotify", label: "Spotify", icon: FaSpotify, brandColor: "#1DB954",
    prefix: "open.spotify.com/", placeholder: "playlist/... track/... ou cole o link",
    build: (h) => buildSpotifySocialUrl(h),
    isFreeform: true },
  { key: "soundcloud", label: "SoundCloud", icon: FaSoundcloud, brandColor: "#FF5500",
    prefix: "soundcloud.com/", placeholder: "yourname",
    build: (h) => `https://soundcloud.com/${h}` },
  { key: "github", label: "GitHub", icon: FaGithub, brandColor: "#181717",
    prefix: "github.com/", placeholder: "yourname",
    build: (h) => `https://github.com/${h}` },
  { key: "linkedin", label: "LinkedIn", icon: FaLinkedin, brandColor: "#0A66C2",
    prefix: "linkedin.com/in/", placeholder: "yourname",
    build: (h) => `https://linkedin.com/in/${h}` },
  { key: "facebook", label: "Facebook", icon: FaFacebook, brandColor: "#1877F2",
    prefix: "facebook.com/", placeholder: "yourname",
    build: (h) => `https://facebook.com/${h}` },
  { key: "pinterest", label: "Pinterest", icon: FaPinterest, brandColor: "#E60023",
    prefix: "pinterest.com/", placeholder: "yourname",
    build: (h) => `https://pinterest.com/${h}` },
  { key: "imgur", label: "Imgur", icon: SiImgur, brandColor: "#1BB76E",
    prefix: "imgur.com/", placeholder: "user/yourname or a/yPwlQKk",
    build: (h) => buildImgurUrl(h) },
  { key: "vsco", label: "VSCO", icon: SiVsco, brandColor: "#000000",
    prefix: "https://", placeholder: "vsco.co/yourname or album link",
    build: (h) => (h.startsWith("http") ? h : `https://${h.replace(/^\/+/, "")}`),
    isFreeform: true },
  { key: "tumblr", label: "Tumblr", icon: FaTumblr, brandColor: "#36465D",
    prefix: "https://", placeholder: "yourblog.tumblr.com",
    build: (h) => {
      const v = h.replace(/^https?:\/\//, "").replace(/\/+$/, "");
      if (v.includes("tumblr.com")) return `https://${v}`;
      return `https://${v}.tumblr.com`;
    },
    isFreeform: true },
  { key: "behance", label: "Behance", icon: SiBehance, brandColor: "#1769FF",
    prefix: "behance.net/", placeholder: "yourname",
    build: (h) => `https://behance.net/${h}` },
  { key: "flickr", label: "Flickr", icon: SiFlickr, brandColor: "#FF0084",
    prefix: "flickr.com/photos/", placeholder: "yourname",
    build: (h) => `https://flickr.com/photos/${h}` },
  { key: "deviantart", label: "DeviantArt", icon: SiDeviantart, brandColor: "#05CC47",
    prefix: "deviantart.com/", placeholder: "yourname",
    build: (h) => `https://deviantart.com/${h}` },
  { key: "artstation", label: "ArtStation", icon: SiArtstation, brandColor: "#13AFF0",
    prefix: "artstation.com/", placeholder: "yourname",
    build: (h) => `https://artstation.com/${h}` },
  { key: "snapchat", label: "Snapchat", icon: FaSnapchatGhost, brandColor: "#FFFC00",
    prefix: "snapchat.com/add/", placeholder: "yourname",
    build: (h) => `https://snapchat.com/add/${h}` },
  { key: "linktree", label: "Linktree", icon: SiLinktree, brandColor: "#43E660",
    prefix: "linktr.ee/", placeholder: "yourname",
    build: (h) => `https://linktr.ee/${h}` },
  { key: "kofi", label: "Ko-fi", icon: SiKofi, brandColor: "#FF5E5B",
    prefix: "ko-fi.com/", placeholder: "yourname",
    build: (h) => `https://ko-fi.com/${h}` },
  { key: "patreon", label: "Patreon", icon: SiPatreon, brandColor: "#FF424D",
    prefix: "patreon.com/", placeholder: "yourname",
    build: (h) => `https://patreon.com/${h}` },
  { key: "reddit", label: "Reddit", icon: FaReddit, brandColor: "#FF4500",
    prefix: "reddit.com/user/", placeholder: "yourname",
    build: (h) => `https://reddit.com/user/${h}` },
  { key: "telegram", label: "Telegram", icon: FaTelegram, brandColor: "#0088CC",
    prefix: "t.me/", placeholder: "yourname",
    build: (h) => `https://t.me/${h}` },
  { key: "whatsapp", label: "WhatsApp", icon: FaWhatsapp, brandColor: "#25D366",
    prefix: "wa.me/", placeholder: "5511999999999",
    build: (h) => `https://wa.me/${h.replace(/\D/g, "")}` },
  { key: "steam", label: "Steam", icon: FaSteam, brandColor: "#171A21",
    prefix: "steamcommunity.com/id/", placeholder: "yourname",
    build: (h) => `https://steamcommunity.com/id/${h}` },
  { key: "email", label: "Email", icon: FaEnvelope, brandColor: "#EA4335",
    prefix: "mailto:", placeholder: "you@email.com",
    build: (h) => `mailto:${h}`, isFreeform: true },
  { key: "website", label: "Site", icon: FaGlobe, brandColor: "#6366F1",
    prefix: "https://", placeholder: "yoursite.com",
    build: (h) => (h.startsWith("http") ? h : `https://${h}`), isFreeform: true },
];

export const SOCIAL_MAP: Record<string, SocialDef> = Object.fromEntries(
  SOCIALS.map((s) => [s.key, s]),
);

function isImgurHost(hostname: string): boolean {
  const host = hostname.replace(/^www\./i, "").toLowerCase();
  return host === "imgur.com" || host.endsWith(".imgur.com");
}

function isYoutubeHost(hostname: string): boolean {
  const host = hostname.replace(/^www\./i, "").toLowerCase();
  return (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com" ||
    host === "youtu.be" ||
    host === "youtube-nocookie.com" ||
    host.endsWith(".youtube.com")
  );
}

function isSpotifyHost(hostname: string): boolean {
  const host = hostname.replace(/^www\./i, "").toLowerCase();
  return host === "spotify.com" || host === "open.spotify.com" || host.endsWith(".spotify.com");
}

/** Canal, vídeo, playlist, shorts — qualquer URL youtube.com / youtu.be. */
function normalizeYoutubeSocial(raw: string): string {
  let v = raw.trim();
  if (!v) return "";

  try {
    const withProto = /^https?:\/\//i.test(v)
      ? v
      : v.toLowerCase().includes("youtube.com") || v.toLowerCase().includes("youtu.be")
        ? `https://${v.replace(/^\/+/, "")}`
        : null;
    if (withProto) {
      const u = new URL(withProto);
      if (!isYoutubeHost(u.hostname)) return "";
      const host = u.hostname.replace(/^www\./i, "").toLowerCase();
      if (host === "youtu.be") {
        const id = u.pathname.replace(/^\/+/, "").split("/")[0];
        return id ? `watch?v=${id}` : "";
      }
      return `${u.pathname}${u.search}`.replace(/^\/+/, "").replace(/\/+$/, "");
    }
  } catch {
    // segue como handle/caminho
  }

  v = v.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  if (/^(?:m\.)?youtube\.com\//i.test(v)) {
    v = v.replace(/^(?:m\.)?youtube\.com\//i, "");
  } else if (/^youtu\.be\//i.test(v)) {
    const id = v.slice("youtu.be/".length).split(/[/?#]/)[0];
    return id ? `watch?v=${id}` : "";
  }
  v = v.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!v) return "";
  // handle legado: só o nome do canal → @nome
  if (!v.includes("/") && !v.includes("?") && !v.startsWith("@")) return `@${v}`;
  return v;
}

function buildYoutubeSocialUrl(handle: string): string {
  const v = normalizeYoutubeSocial(handle);
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return `https://www.youtube.com/${v.replace(/^\/+/, "")}`;
}

/** User, playlist, track, album, artist, show, episode — qualquer open.spotify.com. */
function normalizeSpotifySocial(raw: string): string {
  let v = raw.trim();
  if (!v) return "";

  const uriMatch = v.match(/^spotify:(track|album|playlist|artist|user|show|episode):([a-zA-Z0-9]+)/i);
  if (uriMatch) {
    return `${uriMatch[1].toLowerCase()}/${uriMatch[2]}`;
  }

  try {
    const withProto = /^https?:\/\//i.test(v)
      ? v
      : v.toLowerCase().includes("spotify.com")
        ? `https://${v.replace(/^\/+/, "")}`
        : null;
    if (withProto) {
      const u = new URL(withProto);
      if (!isSpotifyHost(u.hostname)) return "";
      const path = u.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
      const match = path.match(
        /^(?:intl-[a-z]{2}\/)?(track|album|playlist|artist|user|show|episode)\/([a-zA-Z0-9]+)/i,
      );
      if (match) return `${match[1].toLowerCase()}/${match[2]}`;
      return path;
    }
  } catch {
    // segue como caminho/id
  }

  v = v.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  if (/^open\.spotify\.com\//i.test(v)) v = v.slice("open.spotify.com/".length);
  else if (/^spotify\.com\//i.test(v)) v = v.slice("spotify.com/".length);
  v = v.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!v) return "";
  // legado: só o user id
  if (!v.includes("/")) return `user/${v}`;
  const intl = v.match(/^(?:intl-[a-z]{2}\/)?(track|album|playlist|artist|user|show|episode)\/([a-zA-Z0-9]+)/i);
  if (intl) return `${intl[1].toLowerCase()}/${intl[2]}`;
  return v;
}

function buildSpotifySocialUrl(handle: string): string {
  const v = normalizeSpotifySocial(handle);
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return `https://open.spotify.com/${v.replace(/^\/+/, "")}`;
}

/** Aceita user/seunome, a/álbum, gallery/… ou URL completa com imgur.com */
function normalizeImgurHandle(raw: string): string {
  let v = raw.trim();
  if (!v) return "";

  try {
    const withProto = /^https?:\/\//i.test(v) ? v : v.includes("imgur.com") ? `https://${v.replace(/^\/+/, "")}` : null;
    if (withProto) {
      const u = new URL(withProto);
      if (isImgurHost(u.hostname)) {
        const path = `${u.pathname}${u.search}`.replace(/^\/+/, "").replace(/\/+$/, "");
        return path;
      }
    }
  } catch {
    // segue para tratar como caminho relativo
  }

  v = v.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  if (v.toLowerCase().startsWith("imgur.com/")) {
    v = v.slice("imgur.com/".length);
  }
  return v.replace(/^\/+/, "").replace(/^@+/, "").replace(/\/+$/, "");
}

function buildImgurUrl(handle: string): string {
  const path = normalizeImgurHandle(handle);
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  // legado: só o username → /user/seunome
  const finalPath = path.includes("/") ? path : `user/${path}`;
  return `https://imgur.com/${finalPath}`;
}

/** Normalize what user types: strip @, leading slashes, or the URL prefix. */
export function normalizeHandle(def: SocialDef, raw: string): string {
  let v = raw.trim();
  if (!v) return "";
  if (def.key === "imgur") return normalizeImgurHandle(v);
  if (def.key === "youtube") return normalizeYoutubeSocial(v);
  if (def.key === "spotify") return normalizeSpotifySocial(v);
  if (def.isFreeform) return v;
  // If they pasted the full URL, keep only what's after the known prefix.
  try {
    if (v.startsWith("http")) {
      const u = new URL(v);
      v = u.pathname + u.search;
    }
  } catch {}
  v = v.replace(/^\/+/, "").replace(/^@+/, "");
  const p = def.prefix.replace(/^https?:\/\//, "");
  if (v.startsWith(p)) v = v.slice(p.length);
  return v;
}

/** Get the full URL for a stored value (which may be legacy full URL or handle). */
export function resolveSocialUrl(key: string, value: string): string | null {
  if (!value) return null;
  const def = SOCIAL_MAP[key];
  if (!def) return value.startsWith("http") ? value : `https://${value}`;
  if (key === "imgur") return buildImgurUrl(value);
  if (key === "youtube") return buildYoutubeSocialUrl(value) || null;
  if (key === "spotify") return buildSpotifySocialUrl(value) || null;
  if (value.startsWith("http") || value.startsWith("mailto:")) return value;
  return def.build(value);
}
