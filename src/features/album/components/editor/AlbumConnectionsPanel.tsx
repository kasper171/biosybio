import type { Profile } from "@/lib/profile-storage";
import type { AlbumTheme } from "@/features/album/types/album.types";
import { DiscordConnectedCard } from "@/components/dashboard/DiscordConnectedCard";
import { HotelConnectionPanel } from "@/components/dashboard/HotelConnectionPanel";
import { useAlbumI18n } from "@/features/album/i18n/album-messages";
import { AlbumThemeToggle } from "@/features/album/components/editor/AlbumThemeToggle";

type Props = {
  profile: Profile;
  theme: AlbumTheme;
  onThemeChange: (theme: AlbumTheme) => void;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
  onBatchUpdate?: (patch: Partial<Profile>) => void;
};

/** Conexões compartilhadas com o Card Normal — mesma tabela `profiles`. */
export function AlbumConnectionsPanel({ profile, theme, onThemeChange, update, onBatchUpdate }: Props) {
  const { t } = useAlbumI18n();
  const showSidebarConnections = theme.sidebar?.showSidebarConnections !== false;

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

      <AlbumThemeToggle
        label={t("album.connections.showSidebar")}
        description={t("album.connections.showSidebarHint")}
        checked={showSidebarConnections}
        onChange={(checked) =>
          onThemeChange({
            ...theme,
            sidebar: { ...(theme.sidebar ?? {}), showSidebarConnections: checked },
          })
        }
      />

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
