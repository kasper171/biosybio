export type ProfileAssetKind =
  | "avatar"
  | "banner"
  | "background"
  | "inner_banner"
  | "music"
  | "music_art"
  | "share_embed"
  | "page_favicon";

const IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const AUDIO_MIMES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/x-wav",
]);

const MAX_BYTES: Record<ProfileAssetKind, number> = {
  avatar: 5 * 1024 * 1024,
  banner: 10 * 1024 * 1024,
  background: 10 * 1024 * 1024,
  inner_banner: 10 * 1024 * 1024,
  music: 20 * 1024 * 1024,
  music_art: 5 * 1024 * 1024,
  share_embed: 5 * 1024 * 1024,
  page_favicon: 1 * 1024 * 1024,
};

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
  "audio/webm": "webm",
};

export function validateProfileAssetUpload(
  kind: ProfileAssetKind,
  file: File,
): { ok: true; ext: string; contentType: string } | { ok: false; error: string } {
  const maxBytes = MAX_BYTES[kind];
  if (file.size <= 0 || file.size > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    return { ok: false, error: `File exceeds the ${maxMb}MB limit.` };
  }

  const mime = (file.type || "").toLowerCase().split(";")[0].trim();
  const allowed =
    kind === "music"
      ? AUDIO_MIMES.has(mime)
      : IMAGE_MIMES.has(mime);

  if (!allowed) {
    return { ok: false, error: "Unsupported file type." };
  }

  const ext = EXT_BY_MIME[mime];
  if (!ext) {
    return { ok: false, error: "Unsupported file type." };
  }

  return { ok: true, ext, contentType: mime };
}
