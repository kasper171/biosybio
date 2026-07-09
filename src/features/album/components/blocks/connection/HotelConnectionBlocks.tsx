import type { AlbumConnectionsRow } from "@/features/album/types/album.types";
import type { AlbumBlockPublicProps } from "@/features/album/types/block-registry.types";
import {
  albumHabboAvatarUrl,
  albumHabbletAvatarUrl,
} from "@/features/album/lib/hotel/album-hotel-service";

type HabboProps = AlbumBlockPublicProps<"habbo"> & { connections: AlbumConnectionsRow | null };
type HabbletProps = AlbumBlockPublicProps<"habblet"> & { connections: AlbumConnectionsRow | null };

export function HabboConnectionBlockPublic({ connections }: HabboProps) {
  const username = connections?.habbo_username;
  const figure = connections?.habbo_figure;
  const domain = connections?.habbo_domain ?? "com.br";

  if (!username || !figure) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-white/40">
        <span className="text-lg font-bold tracking-wide text-[#f5c400]">Habbo</span>
        <span className="text-xs">Conecte no painel Conexões</span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-3">
      <img
        src={albumHabboAvatarUrl(figure, domain)}
        alt=""
        className="h-24 object-contain drop-shadow-lg"
      />
      <div className="text-center">
        <p className="text-sm font-semibold text-white">{username}</p>
        {connections.habbo_motto ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-white/45">{connections.habbo_motto}</p>
        ) : null}
      </div>
    </div>
  );
}

export function HabboConnectionBlockEditor() {
  return (
    <div className="flex h-full items-center justify-center text-xs text-white/45">
      Vincule Habbo no painel Conexões
    </div>
  );
}

export function HabbletConnectionBlockPublic({ connections }: HabbletProps) {
  const username = connections?.habblet_username;
  const figure = connections?.habblet_figure;

  if (!username || !figure) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-white/40">
        <span className="text-lg font-bold text-[#7dd3fc]">Habblet</span>
        <span className="text-xs">Conecte no painel Conexões</span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-3">
      <img
        src={albumHabbletAvatarUrl(figure)}
        alt=""
        className="h-24 object-contain drop-shadow-lg"
      />
      <div className="text-center">
        <p className="text-sm font-semibold text-white">{username}</p>
        {connections.habblet_motto ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-white/45">{connections.habblet_motto}</p>
        ) : null}
      </div>
    </div>
  );
}

export function HabbletConnectionBlockEditor() {
  return (
    <div className="flex h-full items-center justify-center text-xs text-white/45">
      Vincule Habblet no painel Conexões
    </div>
  );
}
