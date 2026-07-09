import "@tanstack/react-start/server-only";

import type { AlbumMediaKind } from "@/features/album/lib/security/album-upload-validation";
import {
  ALBUM_AUDIO_MAX_BYTES,
  ALBUM_IMAGE_MAX_BYTES,
  ALBUM_VIDEO_MAX_BYTES_FREE,
  ALBUM_VIDEO_MAX_BYTES_PREMIUM,
} from "@/features/album/lib/security/album-upload-validation";

function matchesMagic(buffer: Buffer, bytes: number[]): boolean {
  if (buffer.length < bytes.length) return false;
  return bytes.every((b, i) => buffer[i] === b);
}

export function detectAlbumMediaKindFromBuffer(buffer: Buffer): AlbumMediaKind | null {
  if (matchesMagic(buffer, [0xff, 0xd8, 0xff])) return "image";
  if (matchesMagic(buffer, [0x89, 0x50, 0x4e, 0x47])) return "image";
  if (matchesMagic(buffer, [0x47, 0x49, 0x46, 0x38])) return "image";
  if (matchesMagic(buffer, [0x52, 0x49, 0x46, 0x46]) && buffer.length > 11 && buffer.toString("ascii", 8, 12) === "WEBP") {
    return "image";
  }
  if (matchesMagic(buffer, [0x1a, 0x45, 0xdf, 0xa3])) return "video";
  if (matchesMagic(buffer, [0x00, 0x00, 0x00]) && buffer.length > 7 && buffer.toString("ascii", 4, 8) === "ftyp") {
    return "video";
  }
  if (matchesMagic(buffer, [0x49, 0x44, 0x33])) return "audio";
  if (matchesMagic(buffer, [0xff, 0xfb]) || matchesMagic(buffer, [0xff, 0xf3]) || matchesMagic(buffer, [0xff, 0xf2])) {
    return "audio";
  }
  if (matchesMagic(buffer, [0x4f, 0x67, 0x67, 0x53])) return "audio";
  if (matchesMagic(buffer, [0x52, 0x49, 0x46, 0x46]) && buffer.length > 11 && buffer.toString("ascii", 8, 12) === "WAVE") {
    return "audio";
  }
  return null;
}

const EXT_BY_KIND: Record<AlbumMediaKind, string> = {
  image: "jpg",
  video: "mp4",
  audio: "mp3",
};

const MIME_BY_KIND: Record<AlbumMediaKind, string> = {
  image: "image/jpeg",
  video: "video/mp4",
  audio: "audio/mpeg",
};

export function validateAlbumMediaBuffer(
  buffer: Buffer,
  declaredSize: number,
  options?: { isPremium?: boolean },
): { ok: true; kind: AlbumMediaKind; ext: string; contentType: string } | { ok: false; error: string } {
  if (buffer.length <= 0) return { ok: false, error: "Empty file." };
  if (buffer.length !== declaredSize) return { ok: false, error: "File size mismatch." };

  const kind = detectAlbumMediaKindFromBuffer(buffer);
  if (!kind) return { ok: false, error: "Unsupported file type." };

  let maxBytes = ALBUM_IMAGE_MAX_BYTES;
  if (kind === "video") {
    maxBytes = options?.isPremium ? ALBUM_VIDEO_MAX_BYTES_PREMIUM : ALBUM_VIDEO_MAX_BYTES_FREE;
  } else if (kind === "audio") {
    maxBytes = ALBUM_AUDIO_MAX_BYTES;
  }

  if (buffer.length > maxBytes) {
    return { ok: false, error: "File exceeds size limit." };
  }

  return {
    ok: true,
    kind,
    ext: EXT_BY_KIND[kind],
    contentType: MIME_BY_KIND[kind],
  };
}

export function albumStoragePathOwnedByUser(userId: string, storagePath: string): boolean {
  const normalized = storagePath.replace(/^\/+/, "");
  return normalized.startsWith(`${userId}/`) && !normalized.includes("..");
}
