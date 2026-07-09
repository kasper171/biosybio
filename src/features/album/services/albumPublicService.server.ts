import "@tanstack/react-start/server-only";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type {
  AlbumBlock,
  AlbumConnectionsRow,
  AlbumPublicProfileMeta,
  AlbumTheme,
  ProfileDisplayStyle,
} from "@/features/album/types/album.types";
import { albumBlockSchema, albumThemeSchema } from "@/features/album/lib/security/album-layout-schema";

import {
  albumApplyVisibilityMeta,
  albumProfileIsPublic,
} from "@/features/album/lib/security/album-profile-visibility.server";

const PROFILE_META_SELECT =
  "id, username, display_name, avatar_url, show_username, show_view_count, show_public_uid, view_count, public_uid";

export type AlbumPublicPayload = {
  style: ProfileDisplayStyle;
  meta: AlbumPublicProfileMeta;
  layout: AlbumBlock[];
  theme: AlbumTheme;
  connections: AlbumConnectionsRow | null;
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

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select(PROFILE_META_SELECT)
    .eq("username", clean)
    .maybeSingle();

  if (profileError || !profile) return null;

  if (!albumProfileIsPublic(profile as Parameters<typeof albumProfileIsPublic>[0])) {
    return null;
  }

  const userId = profile.id as string;

  const [{ data: styleRow }, { data: layoutRow }, { data: connections }] = await Promise.all([
    supabaseAdmin.from("profile_display_styles").select("style").eq("user_id", userId).maybeSingle(),
    supabaseAdmin.from("album_layouts").select("layout, theme").eq("user_id", userId).maybeSingle(),
    supabaseAdmin.from("album_connections").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  const style = (styleRow?.style ?? "card") as ProfileDisplayStyle;
  if (style !== "album") return null;

  const visibleProfile = albumApplyVisibilityMeta(profile as Parameters<typeof albumApplyVisibilityMeta>[0]);

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

  return {
    style,
    meta,
    layout: parseLayout(layoutRow?.layout),
    theme: parseTheme(layoutRow?.theme),
    connections: (connections as AlbumConnectionsRow | null) ?? null,
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
