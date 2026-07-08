import '@tanstack/react-start/server-only';

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { PUBLIC_PROFILE_SELECT } from "@/lib/profile/public-profile-columns";

/** Server-only read of a public profile row (explicit allowlist, service role). */
export async function fetchPublicProfileByUsername(
  username: string,
): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(PUBLIC_PROFILE_SELECT)
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.error("[fetchPublicProfileByUsername]", error.message);
    return null;
  }

  if (!data) return null;

  // Enforce privacy toggles at the payload level (not only via UI rendering).
  const row = data as Record<string, unknown>;
  const showUid = row.show_public_uid !== false;
  const showViews = row.show_view_count !== false;

  return {
    ...row,
    public_uid: showUid ? row.public_uid : null,
    view_count: showViews ? row.view_count : 0,
  };
}
