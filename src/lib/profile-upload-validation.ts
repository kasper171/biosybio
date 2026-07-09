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
  /** Premium: mp4 wallpaper/faixa até 30 MB; free até 10 MB. */
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
  "audio/x-m4a",
  "audio/mp4",
]);

const VIDEO_MIMES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/x-m4v",
  "application/mp4",
]);

const IMAGE_MAX_BYTES = 10 * 1024 * 1024;

const MAX_BYTES: Record<ProfileAssetKind, number> = {
  avatar: 5 * 1024 * 1024,
  banner: IMAGE_MAX_BYTES,
  background: IMAGE_MAX_BYTES,
  inner_banner: IMAGE_MAX_BYTES,
  music: IMAGE_MAX_BYTES,
  music_art: 5 * 1024 * 1024,
  share_embed: 5 * 1024 * 1024,
  page_favicon: 1 * 1024 * 1024,
};

const MUSIC_AUDIO_MAX_BYTES = 10 * 1024 * 1024;

export const PROFILE_VIDEO_MAX_BYTES_FREE = 10 * 1024 * 1024;
export const PROFILE_VIDEO_MAX_BYTES_PREMIUM = 30 * 1024 * 1024;

/** @deprecated */
export const MUSIC_VIDEO_MAX_BYTES_FREE = PROFILE_VIDEO_MAX_BYTES_FREE;
/** @deprecated */
export const MUSIC_VIDEO_MAX_BYTES_PREMIUM = PROFILE_VIDEO_MAX_BYTES_PREMIUM;

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
  "audio/x-m4a": "m4a",
  "audio/mp4": "m4a",
  "video/mp4": "mp4",
  "video/quicktime": "mp4",
  "video/x-m4v": "mp4",
  "application/mp4": "mp4",
};

function maxMb(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

function fileExtension(name: string): string {
  const match = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

export function isProfileVideoFile(file: File): boolean {
  const ext = fileExtension(file.name);
  const mime = (file.type || "").toLowerCase().split(";")[0].trim();

  if (ext === "mp4" || ext === "m4v" || ext === "mov") return true;
  if (ext === "m4a") return false;

  if (VIDEO_MIMES.has(mime)) return true;
  if (mime.startsWith("video/")) return true;

  if (file.size > MUSIC_AUDIO_MAX_BYTES && (mime.includes("mp4") || mime === "application/octet-stream")) {
    return true;
  }

  return false;
}

/** @deprecated use isProfileVideoFile */
export const isMusicVideoFile = isProfileVideoFile;

export function isMusicAudioFile(file: File): boolean {
  const mime = (file.type || "").toLowerCase().split(";")[0].trim();
  const ext = fileExtension(file.name);

  if (isProfileVideoFile(file)) return false;
  if (AUDIO_MIMES.has(mime)) return true;
  return ext === "mp3" || ext === "wav" || ext === "ogg" || ext === "webm" || ext === "m4a";
}

function resolveVideoContentType(file: File): string {
  const mime = (file.type || "").toLowerCase().split(";")[0].trim();
  if (mime && (VIDEO_MIMES.has(mime) || mime.startsWith("video/"))) return mime;
  return "video/mp4";
}

function resolveMusicContentType(file: File, isVideo: boolean): string {
  if (isVideo) return resolveVideoContentType(file);
  const mime = (file.type || "").toLowerCase().split(";")[0].trim();
  if (mime && AUDIO_MIMES.has(mime)) return mime;
  const ext = fileExtension(file.name);
  if (ext === "wav") return "audio/wav";
  if (ext === "ogg") return "audio/ogg";
  if (ext === "webm") return "audio/webm";
  if (ext === "m4a") return "audio/mp4";
  return "audio/mpeg";
}

function validateProfileVideoUpload(
  file: File,
  isPremium: boolean,
  premiumRequiredMessage: string,
): { ok: true; ext: string; contentType: string } | { ok: false; error: string } {
  const maxBytes = isPremium ? PROFILE_VIDEO_MAX_BYTES_PREMIUM : PROFILE_VIDEO_MAX_BYTES_FREE;
  if (file.size <= 0 || file.size > maxBytes) {
    if (!isPremium && file.size > PROFILE_VIDEO_MAX_BYTES_FREE) {
      return { ok: false, error: premiumRequiredMessage };
    }
    return { ok: false, error: `File exceeds the ${maxMb(maxBytes)}MB limit.` };
  }
  const ext = fileExtension(file.name) || "mp4";
  return {
    ok: true,
    ext: ext === "mov" || ext === "m4v" ? "mp4" : ext,
    contentType: resolveVideoContentType(file),
  };
}

function validateImageUpload(
  kind: ProfileAssetKind,
  file: File,
): { ok: true; ext: string; contentType: string } | { ok: false; error: string } {
  const mime = (file.type || "").toLowerCase().split(";")[0].trim();
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

export function validateProfileAssetUpload(
  kind: ProfileAssetKind,
  file: File,
  options?: ProfileUploadValidationOptions,
): { ok: true; ext: string; contentType: string } | { ok: false; error: string } {
  const isPremium = options?.isPremium === true;

  if (kind === "background") {
    if (isProfileVideoFile(file)) {
      return validateProfileVideoUpload(
        file,
        isPremium,
        "MP4 wallpaper above 10MB requires Premium (max 30MB).",
      );
    }
    return validateImageUpload(kind, file);
  }

  if (kind === "music") {
    const isVideo = isProfileVideoFile(file);
    const isAudio = isMusicAudioFile(file);

    if (!isVideo && !isAudio) {
      return { ok: false, error: "Unsupported file type. Use mp3 or mp4." };
    }

    if (isVideo) {
      return validateProfileVideoUpload(
        file,
        isPremium,
        "MP4 videos above 10MB require Premium (max 30MB).",
      );
    }

    if (file.size <= 0 || file.size > MUSIC_AUDIO_MAX_BYTES) {
      return { ok: false, error: `File exceeds the ${maxMb(MUSIC_AUDIO_MAX_BYTES)}MB limit.` };
    }

    const mime = (file.type || "").toLowerCase().split(";")[0].trim();
    const ext = EXT_BY_MIME[mime] ?? fileExtension(file.name) ?? "mp3";
    return {
      ok: true,
      ext,
      contentType: resolveMusicContentType(file, false),
    };
  }

  return validateImageUpload(kind, file);
}
