import type { Profile } from "@/lib/profile-storage";
import type { AlbumConnectionsRow } from "@/features/album/types/album.types";
import type { AlbumBlockPublicProps } from "@/features/album/types/block-registry.types";
import { DiscordPresenceCard } from "@/components/DiscordPresenceCard";
import { FaDiscord } from "react-icons/fa";

type Props = AlbumBlockPublicProps<"discord"> & {
  connections: AlbumConnectionsRow | null;
  profile?: Profile | null;
};

export function DiscordConnectionBlockPublic({ block, connections, profile }: Props) {
  const userId = connections?.discord_user_id;
  const showBadges = block.data.showBadges ?? connections?.discord_show_badges ?? true;
  const scale =
    block.data.scale != null
      ? Math.round(block.data.scale * 100)
      : (connections?.discord_inside_scale ?? 100);

  if (!userId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center text-white/40">
        <FaDiscord className="h-8 w-8 text-[#5865F2]" />
        <span className="text-xs">Conecte o Discord no painel Conexões</span>
      </div>
    );
  }

  if (!profile) {
    return <div className="album-block-skeleton h-full w-full" />;
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col justify-center overflow-hidden px-2 py-2">
      <DiscordPresenceCard
        userId={userId}
        variant="inside"
        profileTheme={profile}
        showBadges={showBadges}
        scale={scale}
        stackActivity
      />
    </div>
  );
}

export function DiscordConnectionBlockEditor() {
  return null;
}
