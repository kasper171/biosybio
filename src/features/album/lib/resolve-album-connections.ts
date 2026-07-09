import type { Profile } from "@/lib/profile-storage";
import type { AlbumConnectionsRow } from "@/features/album/types/album.types";

/** Conexões compartilhadas: Card Normal (profiles) é a fonte; album_connections só complementa cache. */
export function resolveAlbumConnections(
  profile: Pick<
    Profile,
    | "id"
    | "discord_user_id"
    | "discord_show_badges"
    | "discord_inside_scale"
    | "habbo_username"
    | "habbo_domain"
    | "habbo_figure"
    | "habbo_motto"
    | "habbo_level"
    | "habbo_synced_at"
    | "habblet_username"
    | "habblet_figure"
    | "habblet_motto"
    | "habblet_achievement_points"
    | "habblet_synced_at"
  >,
  albumRow?: AlbumConnectionsRow | null,
): AlbumConnectionsRow {
  return {
    user_id: profile.id,
    discord_user_id: albumRow?.discord_user_id ?? profile.discord_user_id ?? null,
    discord_show_badges: albumRow?.discord_show_badges ?? profile.discord_show_badges !== false,
    discord_inside_scale: albumRow?.discord_inside_scale ?? profile.discord_inside_scale ?? null,
    habbo_username: albumRow?.habbo_username ?? profile.habbo_username ?? null,
    habbo_domain: albumRow?.habbo_domain ?? profile.habbo_domain ?? null,
    habbo_figure: albumRow?.habbo_figure ?? profile.habbo_figure ?? null,
    habbo_motto: albumRow?.habbo_motto ?? profile.habbo_motto ?? null,
    habbo_level: albumRow?.habbo_level ?? profile.habbo_level ?? null,
    habbo_synced_at: albumRow?.habbo_synced_at ?? profile.habbo_synced_at ?? null,
    habblet_username: albumRow?.habblet_username ?? profile.habblet_username ?? null,
    habblet_figure: albumRow?.habblet_figure ?? profile.habblet_figure ?? null,
    habblet_motto: albumRow?.habblet_motto ?? profile.habblet_motto ?? null,
    habblet_achievement_points:
      albumRow?.habblet_achievement_points ?? profile.habblet_achievement_points ?? null,
    habblet_synced_at: albumRow?.habblet_synced_at ?? profile.habblet_synced_at ?? null,
  };
}
