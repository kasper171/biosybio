import { useRef } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import type { AlbumBlockEditorProps, AlbumBlockPublicProps } from "@/features/album/types/block-registry.types";
import {
  ALBUM_VIDEO_MAX_BYTES_FREE,
  ALBUM_VIDEO_MAX_BYTES_PREMIUM,
} from "@/features/album/lib/security/album-upload-validation";
import { uploadAlbumMediaFile } from "@/features/album/services/albumSupabaseService";
import { AlbumMediaPositionLayer } from "@/features/album/components/blocks/AlbumMediaPositionLayer";
import { profileHasFullAccess } from "@/lib/profile-roles";
import type { Profile } from "@/lib/profile-storage";

type EditorProps = AlbumBlockEditorProps<"video"> & { profile?: Profile | null };

export function VideoBlockEditor({ block, onChange, profile }: EditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isPremium = profile ? profileHasFullAccess(profile) : undefined;
  const maxVideoMb = Math.round(
    (isPremium ? ALBUM_VIDEO_MAX_BYTES_PREMIUM : ALBUM_VIDEO_MAX_BYTES_FREE) / (1024 * 1024),
  );

  if (block.data.url) {
    return (
      <div className="album-block-fill album-block-fill--media">
        <AlbumMediaPositionLayer
        url={block.data.url}
        kind="video"
        posX={block.data.posX ?? 50}
        posY={block.data.posY ?? 50}
        objectFit="contain"
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
      <span className="text-xs">Enviar vídeo (MP4/WebM · até {maxVideoMb}MB)</span>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          toast.loading("Enviando vídeo...", { id: "album-video-upload" });
          void uploadAlbumMediaFile(block.id, f, {
            previousPath: block.data.storagePath,
            previousBytes: block.data.bytes,
            isPremium,
          }).then((r) => {
            if (r.ok) {
              onChange({
                ...block.data,
                url: r.publicUrl,
                storagePath: r.storagePath,
                bytes: r.bytes,
                posX: block.data.posX ?? 50,
                posY: block.data.posY ?? 50,
              });
              toast.success("Vídeo enviado", { id: "album-video-upload" });
            } else {
              toast.error(r.error, { id: "album-video-upload" });
            }
          });
        }}
      />
    </button>
  );
}

export function VideoBlockPublic({ block }: AlbumBlockPublicProps<"video">) {
  if (!block.data.url) return null;
  const posX = block.data.posX ?? 50;
  const posY = block.data.posY ?? 50;
  return (
    <div className="album-block-fill album-block-fill--media">
      <video
        src={block.data.url}
        poster={block.data.posterUrl}
        className="h-full w-full"
        style={{ objectFit: "contain", objectPosition: `${posX}% ${posY}%` }}
        controls={!block.data.autoplay}
        autoPlay={block.data.autoplay}
        muted={block.data.muted ?? true}
        loop={block.data.loop}
        playsInline
        draggable={false}
      />
    </div>
  );
}
