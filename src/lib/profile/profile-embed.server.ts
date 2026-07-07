import { buildProfileShareMeta } from "@/lib/share-embed";

export type ProfileShareEmbedRow = {
  username: string;
  share_embed_title: string | null;
  share_embed_description: string | null;
  share_embed_image_url: string | null;
};

export async function fetchProfileShareEmbed(
  username: string,
): Promise<ProfileShareEmbedRow | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("username, share_embed_title, share_embed_description, share_embed_image_url")
    .eq("username", username)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProfileShareEmbedRow;
}

export function profileShareEmbedHead(username: string, row: ProfileShareEmbedRow) {
  return {
    meta: buildProfileShareMeta(username, row),
  };
}
