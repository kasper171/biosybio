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
  const scale = block.data.scale != null ? Math.round(block.data.scale * 100) : (connections?.discord_inside_scale ?? 100);

  if (!userId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-white/40">
        <FaDiscord className="h-8 w-8 text-[#5865F2]" />
        <span className="text-xs">Conecte o Discord no painel Conexões</span>
      </div>
    );
  }

  if (!profile) {
    return <div className="album-block-skeleton h-full w-full" />;
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <DiscordPresenceCard
        userId={userId}
        variant="outside"
        profileTheme={profile}
        showBadges={showBadges}
        scale={scale}
      />
    </div>
  );
}

export function DiscordConnectionBlockEditor() {
  return null;
}
