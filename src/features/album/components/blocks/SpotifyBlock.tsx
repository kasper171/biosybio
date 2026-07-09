import { Music2 } from "lucide-react";
import type { AlbumBlockEditorProps, AlbumBlockPublicProps } from "@/features/album/types/block-registry.types";
import { albumNormalizeSpotifyEmbedUrl } from "@/features/album/lib/security/album-url-validation";
import { albumSanitizePlainText } from "@/features/album/lib/security/album-sanitize";

export function SpotifyBlockEditor({ block, onChange }: AlbumBlockEditorProps<"spotify">) {
  const normalized = albumNormalizeSpotifyEmbedUrl(block.data.embedUrl);

  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <input
        value={block.data.embedUrl}
        onChange={(e) => {
          const embed = albumNormalizeSpotifyEmbedUrl(e.target.value);
          onChange({
            ...block.data,
            embedUrl: embed ?? e.target.value,
            title: block.data.title,
          });
        }}
        placeholder="URL do Spotify (track, album, playlist...)"
        className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white"
      />
      <input
        value={block.data.title ?? ""}
        onChange={(e) =>
          onChange({ ...block.data, title: albumSanitizePlainText(e.target.value, 120) })
        }
        placeholder="Título (opcional)"
        className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white"
      />
      {normalized ? (
        <iframe
          src={normalized}
          title={block.data.title ?? "Spotify"}
          className="min-h-0 flex-1 rounded-xl border-0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 text-xs text-white/40">
          Cole um link do Spotify
        </div>
      )}
    </div>
  );
}

export function SpotifyBlockPublic({ block }: AlbumBlockPublicProps<"spotify">) {
  const embed = albumNormalizeSpotifyEmbedUrl(block.data.embedUrl);
  if (!embed) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-white/30">
        <Music2 className="h-7 w-7" />
        <span className="text-xs">Spotify</span>
      </div>
    );
  }
  return (
    <iframe
      src={embed}
      title={block.data.title ?? "Spotify"}
      className="h-full w-full rounded-[inherit] border-0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
}
