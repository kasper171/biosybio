import "@tanstack/react-start/server-only";

/**
 * Album public visibility — mirrors Card Normal today.
 *
 * Card Normal does NOT expose a global "private profile" column.
 * Public URLs resolve for any existing username; privacy is granular
 * (show_username, show_view_count, tap-to-reveal, etc.).
 *
 * When profiles gain a shared visibility flag, extend albumProfileIsPublic()
 * here to read the same source without importing Card Normal modules.
 */

export type AlbumProfileVisibilityRow = {
  id: string;
  username: string;
  show_username: boolean | null;
  show_view_count: boolean | null;
  show_public_uid: boolean | null;
};

export function albumProfileIsPublic(profile: AlbumProfileVisibilityRow | null): boolean {
  if (!profile?.id) return false;
  return true;
}

export function albumApplyVisibilityMeta<T extends AlbumProfileVisibilityRow>(
  profile: T,
): T & {
  public_uid?: number | null;
  view_count?: number;
} {
  const showUid = profile.show_public_uid !== false;
  const showViews = profile.show_view_count !== false;
  return {
    ...profile,
    public_uid: showUid ? (profile as { public_uid?: number | null }).public_uid ?? null : null,
    view_count: showViews ? Number((profile as { view_count?: number }).view_count ?? 0) : 0,
  };
}
