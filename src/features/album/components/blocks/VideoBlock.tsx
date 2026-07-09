import { useRef } from "react";
import { Film, Upload } from "lucide-react";
import type { AlbumBlockEditorProps, AlbumBlockPublicProps } from "@/features/album/types/block-registry.types";
import { uploadAlbumMediaFile } from "@/features/album/services/albumSupabaseService";

type EditorProps = AlbumBlockEditorProps<"video">;

export function VideoBlockEditor({ block, onChange }: EditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex h-full flex-col gap-2 p-3">
      {block.data.url ? (
        <video
          src={block.data.url}
          className="max-h-full flex-1 rounded-xl object-cover"
          controls
          muted
          playsInline
        />
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] text-white/50 transition hover:border-[oklch(0.65_0.28_0)] hover:text-white"
        >
          <Upload className="h-5 w-5" />
          <span className="text-xs">Enviar vídeo (mp4/webm)</span>
        </button>
      )}
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
    </div>
  );
}

export function VideoBlockPublic({ block }: AlbumBlockPublicProps<"video">) {
  if (!block.data.url) {
    return (
      <div className="flex h-full items-center justify-center text-white/25">
        <Film className="h-8 w-8" />
      </div>
    );
  }
  return (
    <video
      src={block.data.url}
      poster={block.data.posterUrl}
      className="h-full w-full rounded-[inherit] object-cover"
      controls={!block.data.autoplay}
      autoPlay={block.data.autoplay}
      muted={block.data.muted ?? true}
      loop={block.data.loop}
      playsInline
    />
  );
}
