import { Music2 } from "lucide-react";
import type { AlbumBlockEditorProps, AlbumBlockPublicProps } from "@/features/album/types/block-registry.types";
import { ScaledEmbed } from "@/components/blocks/BlockFrame";
import { parseSpotifyEmbedMeta } from "@/features/album/lib/spotify/album-spotify-embed";

function SpotifyEmbed({ rawUrl, title, kind }: { rawUrl: string; title?: string; kind?: string }) {
  const meta = parseSpotifyEmbedMeta(rawUrl);
  if (!meta) return null;
  const nativeHeight = meta.compact ? 80 : 352;

  return (
    <ScaledEmbed
      src={meta.embedUrl}
      title={title ?? (kind === "playlist" || meta.kind === "playlist" ? "Spotify Playlist" : "Spotify")}
      nativeHeight={nativeHeight}
    />
  );
}

export function SpotifyBlockEditor({ block }: AlbumBlockEditorProps<"spotify">) {
  const meta = parseSpotifyEmbedMeta(block.data.embedUrl);

  if (!meta) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-white/40">
        <Music2 className="h-8 w-8" />
        <span className="text-xs">Cole o link do Spotify no painel lateral</span>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[80px] w-full overflow-hidden">
      <SpotifyEmbed rawUrl={block.data.embedUrl} title={block.data.title} kind={meta.kind} />
    </div>
  );
}

export function SpotifyBlockPublic({ block }: AlbumBlockPublicProps<"spotify">) {
  const meta = parseSpotifyEmbedMeta(block.data.embedUrl);
  if (!meta) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-white/30">
        <Music2 className="h-7 w-7" />
        <span className="text-xs">Spotify</span>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[80px] w-full overflow-hidden">
      <SpotifyEmbed rawUrl={block.data.embedUrl} title={block.data.title} kind={meta.kind} />
    </div>
  );
}
