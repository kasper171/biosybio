import { useRef } from "react";
import { Upload } from "lucide-react";
import type { AlbumBlockEditorProps, AlbumBlockPublicProps } from "@/features/album/types/block-registry.types";
import { uploadAlbumMediaFile } from "@/features/album/services/albumSupabaseService";

type EditorProps = AlbumBlockEditorProps<"image">;

export function ImageBlockEditor({ block, onChange }: EditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (file: File) => {
    const result = await uploadAlbumMediaFile(block.id, file, {
      previousPath: block.data.storagePath,
      previousBytes: block.data.bytes,
    });
    if (result.ok) {
      onChange({
        ...block.data,
        url: result.publicUrl,
        storagePath: result.storagePath,
        bytes: result.bytes,
      });
    }
  };

  if (block.data.url) {
    return (
      <img
        src={block.data.url}
        alt=""
        className="h-full w-full object-cover"
        style={{ objectFit: block.data.objectFit ?? "cover" }}
        draggable={false}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        inputRef.current?.click();
      }}
      className="flex h-full w-full flex-col items-center justify-center gap-2 bg-white/[0.03] text-white/40 transition hover:text-white/70"
    >
      <Upload className="h-5 w-5" />
      <span className="text-xs">Enviar imagem</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFile(f);
        }}
      />
    </button>
  );
}

export function ImageBlockPublic({ block }: AlbumBlockPublicProps<"image">) {
  if (!block.data.url) return null;
  return (
    <img
      src={block.data.url}
      alt=""
      className="h-full w-full object-cover"
      style={{ objectFit: block.data.objectFit ?? "cover" }}
      loading="lazy"
      draggable={false}
    />
  );
}
