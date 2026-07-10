import "@tanstack/react-start/server-only";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type {
  AlbumBlock,
  AlbumConnectionsRow,
  AlbumPublicProfileMeta,
  AlbumTheme,
  ProfileDisplayStyle,
} from "@/features/album/types/album.types";
import type { Profile } from "@/lib/profile-storage";
import { normalizeProfile } from "@/lib/normalize-profile";
import { attachProfileRoles } from "@/lib/profile-roles";
import { resolveAlbumConnections } from "@/features/album/lib/resolve-album-connections";
import { albumBlockSchema, albumThemeSchema } from "@/features/album/lib/security/album-layout-schema";

import {
  albumApplyVisibilityMeta,
  albumProfileIsPublic,
} from "@/features/album/lib/security/album-profile-visibility.server";

export type AlbumPublicPayload = {
  style: ProfileDisplayStyle;
  meta: AlbumPublicProfileMeta;
  profile: Profile;
  layout: AlbumBlock[];
  theme: AlbumTheme;
  connections: AlbumConnectionsRow;
};

function parseLayout(raw: unknown): AlbumBlock[] {
  if (!Array.isArray(raw)) return [];
  const blocks: AlbumBlock[] = [];
  for (const item of raw) {
    const parsed = albumBlockSchema.safeParse(item);
    if (parsed.success) blocks.push(parsed.data as AlbumBlock);
  }
  return blocks;
}

function parseTheme(raw: unknown): AlbumTheme {
  const parsed = albumThemeSchema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : {};
}

/**
 * Server-only public fetch. Reads minimal profile meta (username routing only)
 * plus isolated album tables — never exposes Card Normal layout/blocks.
 */
export async function fetchAlbumPublicProfile(username: string): Promise<AlbumPublicPayload | null> {
  const clean = username.trim().toLowerCase();
  if (!clean) return null;

  const { data: profileRow, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("username", clean)
    .maybeSingle();

  if (profileError || !profileRow) return null;

  if (!albumProfileIsPublic(profileRow as Parameters<typeof albumProfileIsPublic>[0])) {
    return null;
  }

  const userId = profileRow.id as string;
  const normalized = normalizeProfile(profileRow as Record<string, unknown>);
  const profileWithRoles = await attachProfileRoles(normalized);

  const [{ data: styleRow }, { data: layoutRow }, { data: albumConnectionsRow }] = await Promise.all([
    supabaseAdmin.from("profile_display_styles").select("style").eq("user_id", userId).maybeSingle(),
    supabaseAdmin.from("album_layouts").select("layout, theme").eq("user_id", userId).maybeSingle(),
    supabaseAdmin.from("album_connections").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  const layout = parseLayout(layoutRow?.layout);
  const styleFromDb = styleRow?.style as ProfileDisplayStyle | undefined;
  const isAlbumStyle =
    styleFromDb === "album" || (styleFromDb == null && layout.length > 0);
  if (!isAlbumStyle) return null;

  const style: ProfileDisplayStyle = "album";

  const visibleProfile = albumApplyVisibilityMeta(
    profileWithRoles as Parameters<typeof albumApplyVisibilityMeta>[0],
  );

  const showUsername = visibleProfile.show_username !== false;
  const showViewCount = visibleProfile.show_view_count !== false;

  const meta: AlbumPublicProfileMeta = {
    userId,
    username: visibleProfile.username as string,
    displayName: (visibleProfile.display_name as string | null) ?? null,
    avatarUrl: (visibleProfile.avatar_url as string | null) ?? null,
    showUsername,
    showViewCount,
    viewCount: showViewCount ? Number(visibleProfile.view_count ?? 0) : 0,
  };

  const connections = resolveAlbumConnections(profileWithRoles, albumConnectionsRow as AlbumConnectionsRow | null);

  return {
    style,
    meta,
    profile: visibleProfile as Profile,
    layout,
    theme: parseTheme(layoutRow?.theme),
    connections,
  };
}

export async function resolveProfileDisplayStyleByUserId(
  userId: string,
): Promise<ProfileDisplayStyle> {
  const { data } = await supabaseAdmin
    .from("profile_display_styles")
    .select("style")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.style ?? "card") as ProfileDisplayStyle;
}

export async function resolveProfileDisplayStyleByUsername(
  username: string,
): Promise<{ userId: string; style: ProfileDisplayStyle } | null> {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("username", username.trim().toLowerCase())
    .maybeSingle();
  if (!profile?.id) return null;
  const style = await resolveProfileDisplayStyleByUserId(profile.id);
  return { userId: profile.id, style };
}
