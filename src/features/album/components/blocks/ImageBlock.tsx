import { useRef } from "react";
import { ImageIcon, Upload } from "lucide-react";
import type { AlbumBlockEditorProps, AlbumBlockPublicProps } from "@/features/album/types/block-registry.types";
import { uploadAlbumMediaFile } from "@/features/album/services/albumSupabaseService";
import { albumSanitizePlainText } from "@/features/album/lib/security/album-sanitize";

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

  return (
    <div className="flex h-full flex-col gap-2 p-3">
      {block.data.url ? (
        <img
          src={block.data.url}
          alt={block.data.alt ?? ""}
          className="max-h-[55%] flex-1 rounded-xl object-cover"
        />
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] text-white/50 transition hover:border-[oklch(0.65_0.28_0)] hover:text-white"
        >
          <Upload className="h-5 w-5" />
          <span className="text-xs">Enviar imagem</span>
        </button>
      )}
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
      <input
        value={block.data.alt ?? ""}
        onChange={(e) => onChange({ ...block.data, alt: albumSanitizePlainText(e.target.value, 200) })}
        placeholder="Texto alternativo"
        className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white"
      />
    </div>
  );
}

export function ImageBlockPublic({ block }: AlbumBlockPublicProps<"image">) {
  if (!block.data.url) {
    return (
      <div className="flex h-full items-center justify-center text-white/25">
        <ImageIcon className="h-8 w-8" />
      </div>
    );
  }
  return (
    <img
      src={block.data.url}
      alt={block.data.alt ?? ""}
      className="h-full w-full rounded-[inherit] object-cover"
      style={{ objectFit: block.data.objectFit ?? "cover" }}
      loading="lazy"
    />
  );
}
