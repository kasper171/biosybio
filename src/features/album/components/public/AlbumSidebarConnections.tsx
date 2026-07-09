import type { Profile } from "@/lib/profile-storage";
import type { AlbumConnectionsRow, AlbumTheme } from "@/features/album/types/album.types";
import { DiscordPresenceCard } from "@/components/DiscordPresenceCard";
import { HotelProfileCard } from "@/components/HotelProfileCard";
import { getHotelCardLayoutFromProfile } from "@/lib/hotel";
import { profileToHabboData, profileToHabbletData } from "@/lib/hotel/profile-hotel";
import { resolveAlbumSidebarTheme } from "@/features/album/lib/effects/album-sidebar-theme";

type Props = {
  profile: Profile;
  theme: AlbumTheme;
  connections: AlbumConnectionsRow | null;
};

export function AlbumSidebarConnections({ profile, theme, connections }: Props) {
  const sidebar = resolveAlbumSidebarTheme(theme, profile);
  if (!sidebar.visible || sidebar.showSidebarConnections === false) return null;

  const hotelLayout = getHotelCardLayoutFromProfile(profile);
  const habbo = profileToHabboData(profile);
  const habblet = profileToHabbletData(profile);
  const discordId = connections?.discord_user_id ?? profile.discord_user_id;

  if (!discordId && !habbo && !habblet) return null;

  return (
    <div className="album-sidebar-connections space-y-3">
      {discordId ? (
        <DiscordPresenceCard
          userId={discordId}
          variant="outside"
          profileTheme={profile}
          showBadges={connections?.discord_show_badges ?? profile.discord_show_badges !== false}
          scale={connections?.discord_inside_scale ?? profile.discord_inside_scale ?? 100}
          stackActivity
        />
      ) : null}
      {habbo ? (
        <HotelProfileCard
          data={habbo}
          profile={profile}
          layout={hotelLayout}
          variant="outside"
          className="w-full"
        />
      ) : null}
      {habblet ? (
        <HotelProfileCard
          data={habblet}
          profile={profile}
          layout={hotelLayout}
          variant="outside"
          className="w-full"
        />
      ) : null}
    </div>
  );
}
