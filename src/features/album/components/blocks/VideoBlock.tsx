import { useRef } from "react";
import { Upload } from "lucide-react";
import type { AlbumBlockEditorProps, AlbumBlockPublicProps } from "@/features/album/types/block-registry.types";
import { uploadAlbumMediaFile } from "@/features/album/services/albumSupabaseService";

type EditorProps = AlbumBlockEditorProps<"video">;

export function VideoBlockEditor({ block, onChange }: EditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (block.data.url) {
    return (
      <video
        src={block.data.url}
        className="h-full w-full object-cover"
        controls
        muted
        playsInline
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
      <span className="text-xs">Enviar vídeo</span>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          void uploadAlbumMediaFile(block.id, f, {
            previousPath: block.data.storagePath,
            previousBytes: block.data.bytes,
          }).then((r) => {
            if (r.ok) {
              onChange({
                ...block.data,
                url: r.publicUrl,
                storagePath: r.storagePath,
                bytes: r.bytes,
              });
            }
          });
        }}
      />
    </button>
  );
}

export function VideoBlockPublic({ block }: AlbumBlockPublicProps<"video">) {
  if (!block.data.url) return null;
  return (
    <video
      src={block.data.url}
      poster={block.data.posterUrl}
      className="h-full w-full object-cover"
      controls={!block.data.autoplay}
      autoPlay={block.data.autoplay}
      muted={block.data.muted ?? true}
      loop={block.data.loop}
      playsInline
      draggable={false}
    />
  );
}
