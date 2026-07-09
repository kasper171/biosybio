import { supabase } from "@/integrations/supabase/client";
import {
  deleteAlbumMediaFn,
  registerAlbumMediaUploadFn,
  uploadAlbumMediaFn,
} from "@/features/album/services/album.functions";
import {
  detectAlbumMediaKind,
  validateAlbumMediaUpload,
} from "@/features/album/lib/security/album-upload-validation";

export const ALBUM_BUCKET = "album-media";

/** Limite para upload via base64 no server fn (~8MB arquivo). Acima disso usa storage direto. */
const DIRECT_UPLOAD_THRESHOLD = 8 * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read file."));
        return;
      }
      const base64 = result.includes(",") ? (result.split(",")[1] ?? "") : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

async function uploadAlbumMediaDirect(
  blockId: string,
  file: File,
  options?: {
    isPremium?: boolean;
    previousPath?: string;
    previousBytes?: number;
  },
): Promise<
  | { ok: true; publicUrl: string; storagePath: string; bytes: number }
  | { ok: false; error: string }
> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Faça login para enviar arquivos." };

  const validation = validateAlbumMediaUpload(file, options);
  if (!validation.ok) return { ok: false, error: validation.error };

  const storagePath = `${user.id}/${blockId}/${Date.now()}.${validation.ext}`;

  const { error: uploadError } = await supabase.storage.from(ALBUM_BUCKET).upload(storagePath, file, {
    contentType: validation.contentType,
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const registered = await registerAlbumMediaUploadFn({
    data: {
      storagePath,
      bytes: file.size,
      previousPath: options?.previousPath,
      previousBytes: options?.previousBytes,
    },
  });

  if (!registered.ok) {
    await supabase.storage.from(ALBUM_BUCKET).remove([storagePath]);
    return { ok: false, error: registered.error };
  }

  const { data: publicData } = supabase.storage.from(ALBUM_BUCKET).getPublicUrl(storagePath);
  return {
    ok: true,
    publicUrl: publicData.publicUrl,
    storagePath,
    bytes: file.size,
  };
}

export async function uploadAlbumMediaFile(
  blockId: string,
  file: File,
  options?: {
    isPremium?: boolean;
    previousPath?: string;
    previousBytes?: number;
  },
): Promise<
  | { ok: true; publicUrl: string; storagePath: string; bytes: number }
  | { ok: false; error: string }
> {
  const kind = detectAlbumMediaKind(file);
  if (
    file.size >= DIRECT_UPLOAD_THRESHOLD ||
    file.type.startsWith("video/") ||
    kind === "video"
  ) {
    return uploadAlbumMediaDirect(blockId, file, options);
  }

  const base64 = await fileToBase64(file);
  const result = await uploadAlbumMediaFn({
    data: {
      blockId,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      base64,
      previousPath: options?.previousPath,
      previousBytes: options?.previousBytes,
      isPremium: options?.isPremium,
    },
  });

  if (!result.ok) {
    return uploadAlbumMediaDirect(blockId, file, options);
  }

  return {
    ok: true,
    publicUrl: result.publicUrl,
    storagePath: result.storagePath,
    bytes: result.bytes,
  };
}

export async function deleteAlbumMediaFile(
  storagePath: string,
  bytes: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return deleteAlbumMediaFn({ data: { storagePath, bytes } });
}

export async function fetchAlbumConnectionsClient(userId: string) {
  const { data, error } = await supabase
    .from("album_connections")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.warn("[album_connections]", error.message);
    return null;
  }
  return data;
}
