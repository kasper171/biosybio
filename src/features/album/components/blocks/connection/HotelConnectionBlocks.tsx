import type { Profile } from "@/lib/profile-storage";
import type { AlbumConnectionsRow } from "@/features/album/types/album.types";
import type { AlbumBlockPublicProps } from "@/features/album/types/block-registry.types";
import { HotelProfileCard } from "@/components/HotelProfileCard";
import { getHotelCardLayoutFromProfile } from "@/lib/hotel";
import { profileToHabboData, profileToHabbletData } from "@/lib/hotel/profile-hotel";

type HabboProps = AlbumBlockPublicProps<"habbo"> & {
  connections: AlbumConnectionsRow | null;
  profile?: Profile | null;
};
type HabbletProps = AlbumBlockPublicProps<"habblet"> & {
  connections: AlbumConnectionsRow | null;
  profile?: Profile | null;
};

export function HabboConnectionBlockPublic({ profile }: HabboProps) {
  if (!profile) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-white/40">
        <span className="text-lg font-bold tracking-wide text-[#f5c400]">Habbo</span>
        <span className="text-xs">Conecte no painel Conexões</span>
      </div>
    );
  }

  const data = profileToHabboData(profile);
  if (!data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-white/40">
        <span className="text-lg font-bold tracking-wide text-[#f5c400]">Habbo</span>
        <span className="text-xs">Conecte no painel Conexões</span>
      </div>
    );
  }

  const layout = getHotelCardLayoutFromProfile(profile);

  return (
    <div className="h-full w-full overflow-hidden">
      <HotelProfileCard
        data={data}
        profile={profile}
        layout={layout}
        variant="outside"
        className="h-full w-full"
      />
    </div>
  );
}

export function HabboConnectionBlockEditor() {
  return null;
}

export function HabbletConnectionBlockPublic({ profile }: HabbletProps) {
  if (!profile) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-white/40">
        <span className="text-lg font-bold text-[#7dd3fc]">Habblet</span>
        <span className="text-xs">Conecte no painel Conexões</span>
      </div>
    );
  }

  const data = profileToHabbletData(profile);
  if (!data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-white/40">
        <span className="text-lg font-bold text-[#7dd3fc]">Habblet</span>
        <span className="text-xs">Conecte no painel Conexões</span>
      </div>
    );
  }

  const layout = getHotelCardLayoutFromProfile(profile);

  return (
    <div className="h-full w-full overflow-hidden">
      <HotelProfileCard
        data={data}
        profile={profile}
        layout={layout}
        variant="outside"
        className="h-full w-full"
      />
    </div>
  );
}

export function HabbletConnectionBlockEditor() {
  return null;
}
