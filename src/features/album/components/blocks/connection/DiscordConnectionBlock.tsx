import { useEffect, useState } from "react";
import { FaDiscord } from "react-icons/fa";
import type { AlbumConnectionsRow } from "@/features/album/types/album.types";
import type { AlbumBlockPublicProps } from "@/features/album/types/block-registry.types";
import { albumFetchDiscordPresenceFn } from "@/features/album/lib/discord/album-discord.functions";

type Props = AlbumBlockPublicProps<"discord"> & {
  connections: AlbumConnectionsRow | null;
};

export function DiscordConnectionBlockPublic({ connections }: Props) {
  const userId = connections?.discord_user_id;
  const [presence, setPresence] = useState<{
    username: string;
    globalName: string | null;
    avatarUrl: string;
    activity: string | null;
  } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void albumFetchDiscordPresenceFn({ data: { userId } }).then((res) => {
      if (cancelled || !res.ok) return;
      const avatar = res.user.avatar
        ? `https://cdn.discordapp.com/avatars/${res.user.id}/${res.user.avatar}.png?size=128`
        : `https://cdn.discordapp.com/embed/avatars/0.png`;
      const activity =
        res.spotify?.song?.name ??
        (Array.isArray(res.activities) && res.activities[0]?.name
          ? String(res.activities[0].name)
          : null);
      setPresence({
        username: res.user.username,
        globalName: res.user.global_name ?? null,
        avatarUrl: avatar,
        activity,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!userId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-white/40">
        <FaDiscord className="h-8 w-8 text-[#5865F2]" />
        <span className="text-xs">Conecte o Discord no painel</span>
      </div>
    );
  }

  if (!presence) {
    return <div className="album-block-skeleton h-full w-full" />;
  }

  return (
    <div className="flex h-full items-center gap-3 p-4">
      <img
        src={presence.avatarUrl}
        alt=""
        className="h-14 w-14 shrink-0 rounded-2xl border border-white/10 object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
          <FaDiscord className="h-4 w-4 text-[#5865F2]" />
          <span className="truncate">{presence.globalName ?? presence.username}</span>
        </div>
        {presence.activity ? (
          <p className="mt-1 truncate text-xs text-white/50">{presence.activity}</p>
        ) : (
          <p className="mt-1 text-xs text-white/35">Online</p>
        )}
      </div>
    </div>
  );
}

export function DiscordConnectionBlockEditor() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-white/45">
      <FaDiscord className="h-9 w-9 text-[#5865F2]" />
      <p className="text-xs">Use o painel Conexões para vincular Discord</p>
    </div>
  );
}
