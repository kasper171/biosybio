import { Music2 } from "lucide-react";
import type { AlbumBlockEditorProps, AlbumBlockPublicProps } from "@/features/album/types/block-registry.types";
import { ScaledEmbed } from "@/components/blocks/BlockFrame";
import { parseSpotifyEmbedMeta } from "@/features/album/lib/spotify/album-spotify-embed";

function SpotifyEmbed({ embedUrl, title, kind }: { embedUrl: string; title?: string; kind?: string }) {
  const meta = parseSpotifyEmbedMeta(embedUrl);
  const nativeHeight = meta?.compact ? 80 : 352;
  const src = meta?.embedUrl ?? embedUrl;

  return (
    <ScaledEmbed
      src={src}
      title={title ?? (kind === "playlist" ? "Spotify Playlist" : "Spotify")}
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
    <div className="h-full w-full overflow-hidden">
      <SpotifyEmbed embedUrl={block.data.embedUrl} title={block.data.title} kind={meta.kind} />
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
    <div className="h-full w-full overflow-hidden">
      <SpotifyEmbed embedUrl={block.data.embedUrl} title={block.data.title} kind={meta.kind} />
    </div>
  );
}
