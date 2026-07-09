import { useRef } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import type { AlbumBlockEditorProps, AlbumBlockPublicProps } from "@/features/album/types/block-registry.types";
import { uploadAlbumMediaFile } from "@/features/album/services/albumSupabaseService";
import { AlbumMediaPositionLayer } from "@/features/album/components/blocks/AlbumMediaPositionLayer";

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
        posX: block.data.posX ?? 50,
        posY: block.data.posY ?? 50,
      });
    } else {
      toast.error(result.error);
    }
  };

  if (block.data.url) {
    return (
      <div className="album-block-fill">
        <AlbumMediaPositionLayer
        url={block.data.url}
        kind="image"
        posX={block.data.posX ?? 50}
        posY={block.data.posY ?? 50}
        objectFit={block.data.objectFit ?? "cover"}
        editable
        onChange={(x, y) => onChange({ ...block.data, posX: x, posY: y })}
        />
      </div>
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
    <div className="album-block-fill">
      <AlbumMediaPositionLayer
      url={block.data.url}
      kind="image"
      posX={block.data.posX ?? 50}
      posY={block.data.posY ?? 50}
      objectFit={block.data.objectFit ?? "cover"}
      />
    </div>
  );
}
