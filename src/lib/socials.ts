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
    prefix: "instagram.com/", placeholder: "seunome",
    build: (h) => `https://instagram.com/${h}` },
  { key: "tiktok", label: "TikTok", icon: FaTiktok, brandColor: "#000000",
    prefix: "tiktok.com/@", placeholder: "seunome",
    build: (h) => `https://tiktok.com/@${h}` },
  { key: "youtube", label: "YouTube", icon: FaYoutube, brandColor: "#FF0000",
    prefix: "youtube.com/@", placeholder: "seucanal",
    build: (h) => `https://youtube.com/@${h}` },
  { key: "twitter", label: "X / Twitter", icon: FaTwitter, brandColor: "#1DA1F2",
    prefix: "x.com/", placeholder: "seunome",
    build: (h) => `https://x.com/${h}` },
  { key: "threads", label: "Threads", icon: SiThreads, brandColor: "#000000",
    prefix: "threads.net/@", placeholder: "seunome",
    build: (h) => `https://threads.net/@${h}` },
  { key: "twitch", label: "Twitch", icon: FaTwitch, brandColor: "#9146FF",
    prefix: "twitch.tv/", placeholder: "seucanal",
    build: (h) => `https://twitch.tv/${h}` },
  { key: "kick", label: "Kick", icon: SiKick, brandColor: "#53FC18",
    prefix: "kick.com/", placeholder: "seucanal",
    build: (h) => `https://kick.com/${h}` },
  { key: "discord", label: "Discord", icon: FaDiscord, brandColor: "#5865F2",
    prefix: "discord.gg/", placeholder: "convite",
    build: (h) => `https://discord.gg/${h}` },
  { key: "spotify", label: "Spotify", icon: FaSpotify, brandColor: "#1DB954",
    prefix: "open.spotify.com/user/", placeholder: "seu-id",
    build: (h) => `https://open.spotify.com/user/${h}` },
  { key: "soundcloud", label: "SoundCloud", icon: FaSoundcloud, brandColor: "#FF5500",
    prefix: "soundcloud.com/", placeholder: "seunome",
    build: (h) => `https://soundcloud.com/${h}` },
  { key: "github", label: "GitHub", icon: FaGithub, brandColor: "#181717",
    prefix: "github.com/", placeholder: "seunome",
    build: (h) => `https://github.com/${h}` },
  { key: "linkedin", label: "LinkedIn", icon: FaLinkedin, brandColor: "#0A66C2",
    prefix: "linkedin.com/in/", placeholder: "seunome",
    build: (h) => `https://linkedin.com/in/${h}` },
  { key: "facebook", label: "Facebook", icon: FaFacebook, brandColor: "#1877F2",
    prefix: "facebook.com/", placeholder: "seunome",
    build: (h) => `https://facebook.com/${h}` },
  { key: "pinterest", label: "Pinterest", icon: FaPinterest, brandColor: "#E60023",
    prefix: "pinterest.com/", placeholder: "seunome",
    build: (h) => `https://pinterest.com/${h}` },
  { key: "imgur", label: "Imgur", icon: SiImgur, brandColor: "#1BB76E",
    prefix: "imgur.com/user/", placeholder: "seunome",
    build: (h) => `https://imgur.com/user/${h}` },
  { key: "vsco", label: "VSCO", icon: SiVsco, brandColor: "#000000",
    prefix: "https://", placeholder: "vsco.co/seunome ou link do álbum",
    build: (h) => (h.startsWith("http") ? h : `https://${h.replace(/^\/+/, "")}`),
    isFreeform: true },
  { key: "tumblr", label: "Tumblr", icon: FaTumblr, brandColor: "#36465D",
    prefix: "https://", placeholder: "seublog.tumblr.com",
    build: (h) => {
      const v = h.replace(/^https?:\/\//, "").replace(/\/+$/, "");
      if (v.includes("tumblr.com")) return `https://${v}`;
      return `https://${v}.tumblr.com`;
    },
    isFreeform: true },
  { key: "behance", label: "Behance", icon: SiBehance, brandColor: "#1769FF",
    prefix: "behance.net/", placeholder: "seunome",
    build: (h) => `https://behance.net/${h}` },
  { key: "flickr", label: "Flickr", icon: SiFlickr, brandColor: "#FF0084",
    prefix: "flickr.com/photos/", placeholder: "seunome",
    build: (h) => `https://flickr.com/photos/${h}` },
  { key: "deviantart", label: "DeviantArt", icon: SiDeviantart, brandColor: "#05CC47",
    prefix: "deviantart.com/", placeholder: "seunome",
    build: (h) => `https://deviantart.com/${h}` },
  { key: "artstation", label: "ArtStation", icon: SiArtstation, brandColor: "#13AFF0",
    prefix: "artstation.com/", placeholder: "seunome",
    build: (h) => `https://artstation.com/${h}` },
  { key: "snapchat", label: "Snapchat", icon: FaSnapchatGhost, brandColor: "#FFFC00",
    prefix: "snapchat.com/add/", placeholder: "seunome",
    build: (h) => `https://snapchat.com/add/${h}` },
  { key: "linktree", label: "Linktree", icon: SiLinktree, brandColor: "#43E660",
    prefix: "linktr.ee/", placeholder: "seunome",
    build: (h) => `https://linktr.ee/${h}` },
  { key: "kofi", label: "Ko-fi", icon: SiKofi, brandColor: "#FF5E5B",
    prefix: "ko-fi.com/", placeholder: "seunome",
    build: (h) => `https://ko-fi.com/${h}` },
  { key: "patreon", label: "Patreon", icon: SiPatreon, brandColor: "#FF424D",
    prefix: "patreon.com/", placeholder: "seunome",
    build: (h) => `https://patreon.com/${h}` },
  { key: "reddit", label: "Reddit", icon: FaReddit, brandColor: "#FF4500",
    prefix: "reddit.com/user/", placeholder: "seunome",
    build: (h) => `https://reddit.com/user/${h}` },
  { key: "telegram", label: "Telegram", icon: FaTelegram, brandColor: "#0088CC",
    prefix: "t.me/", placeholder: "seunome",
    build: (h) => `https://t.me/${h}` },
  { key: "whatsapp", label: "WhatsApp", icon: FaWhatsapp, brandColor: "#25D366",
    prefix: "wa.me/", placeholder: "5511999999999",
    build: (h) => `https://wa.me/${h.replace(/\D/g, "")}` },
  { key: "steam", label: "Steam", icon: FaSteam, brandColor: "#171A21",
    prefix: "steamcommunity.com/id/", placeholder: "seunome",
    build: (h) => `https://steamcommunity.com/id/${h}` },
  { key: "email", label: "Email", icon: FaEnvelope, brandColor: "#EA4335",
    prefix: "mailto:", placeholder: "voce@email.com",
    build: (h) => `mailto:${h}`, isFreeform: true },
  { key: "website", label: "Site", icon: FaGlobe, brandColor: "#6366F1",
    prefix: "https://", placeholder: "seusite.com",
    build: (h) => (h.startsWith("http") ? h : `https://${h}`), isFreeform: true },
];

export const SOCIAL_MAP: Record<string, SocialDef> = Object.fromEntries(
  SOCIALS.map((s) => [s.key, s]),
);

/** Normalize what user types: strip @, leading slashes, or the URL prefix. */
export function normalizeHandle(def: SocialDef, raw: string): string {
  let v = raw.trim();
  if (!v) return "";
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
  if (value.startsWith("http") || value.startsWith("mailto:")) return value;
  return def.build(value);
}
