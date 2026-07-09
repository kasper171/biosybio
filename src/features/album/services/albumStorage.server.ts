import "@tanstack/react-start/server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { ALBUM_STORAGE_QUOTA_BYTES } from "@/features/album/lib/security/album-upload-validation";

type AdminClient = SupabaseClient<Database>;

export async function albumReserveStorageBytes(
  admin: AdminClient,
  userId: string,
  bytes: number,
): Promise<boolean> {
  const { data, error } = await admin.rpc("album_reserve_storage_bytes", {
    p_user_id: userId,
    p_bytes: bytes,
    p_max_bytes: ALBUM_STORAGE_QUOTA_BYTES,
  });
  if (error) {
    console.error("[albumReserveStorageBytes]", error.message);
    return false;
  }
  return data === true;
}

export async function albumReleaseStorageBytes(
  admin: AdminClient,
  userId: string,
  bytes: number,
): Promise<void> {
  const { error } = await admin.rpc("album_release_storage_bytes", {
    p_user_id: userId,
    p_bytes: bytes,
  });
  if (error) {
    console.error("[albumReleaseStorageBytes]", error.message);
  }
}

export async function albumGetStorageBytesUsed(
  admin: AdminClient,
  userId: string,
): Promise<number> {
  const { data } = await admin
    .from("album_layouts")
    .select("storage_bytes_used")
    .eq("user_id", userId)
    .maybeSingle();
  return Number(data?.storage_bytes_used ?? 0);
}
