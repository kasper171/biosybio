import type { Profile } from "@/lib/profile-storage";
import type { AlbumConnectionsRow } from "@/features/album/types/album.types";
import type { AlbumBlockPublicProps } from "@/features/album/types/block-registry.types";
import { HotelProfileCard } from "@/components/HotelProfileCard";
import { getHotelCardFrameStyle, getHotelCardLayoutFromProfile } from "@/lib/hotel";
import { profileToHabboData, profileToHabbletData } from "@/lib/hotel/profile-hotel";
import { AlbumBlockFit } from "@/features/album/components/blocks/AlbumBlockFit";

type HabboProps = AlbumBlockPublicProps<"habbo"> & {
  connections: AlbumConnectionsRow | null;
  profile?: Profile | null;
};
type HabbletProps = AlbumBlockPublicProps<"habblet"> & {
  connections: AlbumConnectionsRow | null;
  profile?: Profile | null;
};

function HotelGridBlock({ profile, platform }: { profile: Profile; platform: "habbo" | "habblet" }) {
  const data = platform === "habbo" ? profileToHabboData(profile) : profileToHabbletData(profile);
  if (!data) return null;
  const layout = getHotelCardLayoutFromProfile(profile);
  const frameStyle = getHotelCardFrameStyle(layout.size, layout.shape);
  const frameHeight = typeof frameStyle.height === "number" ? frameStyle.height : 140;

  return (
    <AlbumBlockFit className="album-block-fill album-block-fill--fit">
      <div className="album-hotel-block-card w-full max-w-[20rem]" style={{ height: frameHeight }}>
        <HotelProfileCard
          data={data}
          profile={profile}
          layout={layout}
          variant="inside"
          className="h-full w-full min-w-0"
        />
      </div>
    </AlbumBlockFit>
  );
}

export function HabboConnectionBlockPublic({ profile }: HabboProps) {
  if (!profile || !profileToHabboData(profile)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center text-white/40">
        <span className="text-lg font-bold tracking-wide text-[#f5c400]">Habbo</span>
        <span className="text-xs">Conecte no painel Conexões</span>
      </div>
    );
  }
  return <HotelGridBlock profile={profile} platform="habbo" />;
}

export function HabboConnectionBlockEditor() {
  return null;
}

export function HabbletConnectionBlockPublic({ profile }: HabbletProps) {
  if (!profile || !profileToHabbletData(profile)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center text-white/40">
        <span className="text-lg font-bold text-[#7dd3fc]">Habblet</span>
        <span className="text-xs">Conecte no painel Conexões</span>
      </div>
    );
  }
  return <HotelGridBlock profile={profile} platform="habblet" />;
}

export function HabbletConnectionBlockEditor() {
  return null;
}
