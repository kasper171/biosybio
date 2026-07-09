import type { Profile } from "@/lib/profile-storage";
import { DiscordConnectedCard } from "@/components/dashboard/DiscordConnectedCard";
import { HotelConnectionPanel } from "@/components/dashboard/HotelConnectionPanel";
import { useAlbumI18n } from "@/features/album/i18n/album-messages";

type Props = {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
  onBatchUpdate?: (patch: Partial<Profile>) => void;
};

/** Conexões compartilhadas com o Card Normal — mesma tabela `profiles`. */
export function AlbumConnectionsPanel({ profile, update, onBatchUpdate }: Props) {
  const { t } = useAlbumI18n();

  const applyPatch = (patch: Partial<Profile>) => {
    if (onBatchUpdate) {
      onBatchUpdate(patch);
      return;
    }
    (Object.entries(patch) as [keyof Profile, Profile[keyof Profile]][]).forEach(([k, v]) =>
      update(k, v),
    );
  };

  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs leading-relaxed text-white/50">
        {t("album.connections.sharedNote")}
      </p>

      {profile.discord_user_id ? (
        <DiscordConnectedCard
          userId={profile.discord_user_id}
          onDisconnect={() => update("discord_user_id", null)}
        />
      ) : null}

      <HotelConnectionPanel profile={profile} update={update} onBatchUpdate={applyPatch} />
    </div>
  );
}
