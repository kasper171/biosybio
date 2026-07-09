import {
  deleteAlbumMediaFn,
  uploadAlbumMediaFn,
} from "@/features/album/services/album.functions";
import { supabase } from "@/integrations/supabase/client";
import type { AlbumTheme, ProfileDisplayStyle } from "@/features/album/types/album.types";

export const ALBUM_BUCKET = "album-media";

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

  if (!result.ok) return result;
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
  if (error) throw error;
  return data;
}

export async function upsertAlbumThemeClient(userId: string, theme: AlbumTheme): Promise<void> {
  const { error } = await supabase.from("album_layouts").upsert(
    { user_id: userId, theme },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

export async function readDisplayStyleClient(userId: string): Promise<ProfileDisplayStyle> {
  const { data } = await supabase
    .from("profile_display_styles")
    .select("style")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.style ?? "card") as ProfileDisplayStyle;
}
