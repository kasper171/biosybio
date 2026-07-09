export type ProfileAssetKind =
  | "avatar"
  | "banner"
  | "background"
  | "inner_banner"
  | "music"
  | "music_art"
  | "share_embed"
  | "page_favicon";

export type ProfileUploadValidationOptions = {
  /** Premium: vídeos mp4 até 30 MB; free até 10 MB. */
  isPremium?: boolean;
};

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

const VIDEO_MIMES = new Set(["video/mp4"]);

const MAX_BYTES: Record<ProfileAssetKind, number> = {
  avatar: 5 * 1024 * 1024,
  banner: 10 * 1024 * 1024,
  background: 10 * 1024 * 1024,
  inner_banner: 10 * 1024 * 1024,
  music: 10 * 1024 * 1024,
  music_art: 5 * 1024 * 1024,
  share_embed: 5 * 1024 * 1024,
  page_favicon: 1 * 1024 * 1024,
};

/** Áudio na faixa de música — limite geral (não vídeo). */
const MUSIC_AUDIO_MAX_BYTES = 10 * 1024 * 1024;

/** Vídeo mp4 — free até 10 MB; Premium até 30 MB. */
export const MUSIC_VIDEO_MAX_BYTES_FREE = 10 * 1024 * 1024;
export const MUSIC_VIDEO_MAX_BYTES_PREMIUM = 30 * 1024 * 1024;

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
  "video/mp4": "mp4",
};

function maxMb(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

export function validateProfileAssetUpload(
  kind: ProfileAssetKind,
  file: File,
  options?: ProfileUploadValidationOptions,
): { ok: true; ext: string; contentType: string } | { ok: false; error: string } {
  const mime = (file.type || "").toLowerCase().split(";")[0].trim();
  const isPremium = options?.isPremium === true;

  if (kind === "music") {
    const isVideo = VIDEO_MIMES.has(mime);
    const isAudio = AUDIO_MIMES.has(mime);

    if (!isVideo && !isAudio) {
      return { ok: false, error: "Unsupported file type. Use mp3 or mp4." };
    }

    if (isVideo) {
      const maxBytes = isPremium ? MUSIC_VIDEO_MAX_BYTES_PREMIUM : MUSIC_VIDEO_MAX_BYTES_FREE;
      if (file.size <= 0 || file.size > maxBytes) {
        if (!isPremium && file.size > MUSIC_VIDEO_MAX_BYTES_FREE) {
          return {
            ok: false,
            error: "MP4 videos above 10MB require Premium (max 30MB).",
          };
        }
        return {
          ok: false,
          error: `File exceeds the ${maxMb(maxBytes)}MB limit.`,
        };
      }
    } else if (file.size <= 0 || file.size > MUSIC_AUDIO_MAX_BYTES) {
      return { ok: false, error: `File exceeds the ${maxMb(MUSIC_AUDIO_MAX_BYTES)}MB limit.` };
    }

    const ext = EXT_BY_MIME[mime];
    if (!ext) return { ok: false, error: "Unsupported file type." };
    return { ok: true, ext, contentType: mime };
  }

  const maxBytes = MAX_BYTES[kind];
  if (file.size <= 0 || file.size > maxBytes) {
    return { ok: false, error: `File exceeds the ${maxMb(maxBytes)}MB limit.` };
  }

  if (!IMAGE_MIMES.has(mime)) {
    return { ok: false, error: "Unsupported file type." };
  }

  const ext = EXT_BY_MIME[mime];
  if (!ext) {
    return { ok: false, error: "Unsupported file type." };
  }

  return { ok: true, ext, contentType: mime };
}
