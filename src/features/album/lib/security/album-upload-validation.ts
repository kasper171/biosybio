/** ALBUM_COPY — upload validation isolated from profile-assets */

export type AlbumMediaKind = "image" | "video" | "audio";

const IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const VIDEO_MIMES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/mp4",
]);

const AUDIO_MIMES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
]);

export const ALBUM_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const ALBUM_VIDEO_MAX_BYTES_FREE = 10 * 1024 * 1024;
export const ALBUM_VIDEO_MAX_BYTES_PREMIUM = 30 * 1024 * 1024;
export const ALBUM_AUDIO_MAX_BYTES = 10 * 1024 * 1024;
/** Per-user quota across album-media bucket */
export const ALBUM_STORAGE_QUOTA_BYTES = 200 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mp4",
  "application/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
  "audio/webm": "webm",
};

function fileExtension(name: string): string {
  const match = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

function maxMb(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

export function detectAlbumMediaKind(file: File): AlbumMediaKind | null {
  const mime = (file.type || "").toLowerCase().split(";")[0].trim();
  const ext = fileExtension(file.name);
  if (IMAGE_MIMES.has(mime) || ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "image";
  if (VIDEO_MIMES.has(mime) || mime.startsWith("video/") || ["mp4", "webm", "mov", "m4v"].includes(ext)) {
    return "video";
  }
  if (AUDIO_MIMES.has(mime) || ["mp3", "wav", "ogg", "m4a"].includes(ext)) return "audio";
  return null;
}

export function validateAlbumMediaUpload(
  file: File,
  options?: { isPremium?: boolean; currentBytesUsed?: number },
): { ok: true; kind: AlbumMediaKind; ext: string; contentType: string } | { ok: false; error: string } {
  const kind = detectAlbumMediaKind(file);
  if (!kind) return { ok: false, error: "Unsupported file type." };
  if (file.size <= 0) return { ok: false, error: "Empty file." };

  const used = options?.currentBytesUsed ?? 0;
  if (used + file.size > ALBUM_STORAGE_QUOTA_BYTES) {
    return { ok: false, error: "Album storage quota exceeded." };
  }

  const mime = (file.type || "").toLowerCase().split(";")[0].trim();
  let maxBytes = ALBUM_IMAGE_MAX_BYTES;
  if (kind === "video") {
    maxBytes = options?.isPremium ? ALBUM_VIDEO_MAX_BYTES_PREMIUM : ALBUM_VIDEO_MAX_BYTES_FREE;
  } else if (kind === "audio") {
    maxBytes = ALBUM_AUDIO_MAX_BYTES;
  }

  if (file.size > maxBytes) {
    return { ok: false, error: `File exceeds the ${maxMb(maxBytes)}MB limit.` };
  }

  if (kind === "image" && !IMAGE_MIMES.has(mime)) {
    return { ok: false, error: "Unsupported image type." };
  }
  if (kind === "video" && !VIDEO_MIMES.has(mime) && !mime.startsWith("video/")) {
    return { ok: false, error: "Unsupported video type." };
  }
  if (kind === "audio" && !AUDIO_MIMES.has(mime)) {
    return { ok: false, error: "Unsupported audio type." };
  }

  const ext = EXT_BY_MIME[mime] ?? fileExtension(file.name);
  if (!ext) return { ok: false, error: "Unsupported file type." };

  return { ok: true, kind, ext, contentType: mime || "application/octet-stream" };
}
