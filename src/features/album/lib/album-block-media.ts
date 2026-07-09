import type { AlbumBlock } from "@/features/album/types/album.types";
import { deleteAlbumMediaFile } from "@/features/album/services/albumSupabaseService";

export async function releaseAlbumBlockMedia(block: AlbumBlock): Promise<void> {
  if (block.type !== "image" && block.type !== "video") return;
  const data = block.data as { storagePath?: string; bytes?: number };
  if (!data.storagePath || !data.bytes) return;
  await deleteAlbumMediaFile(data.storagePath, data.bytes);
}
