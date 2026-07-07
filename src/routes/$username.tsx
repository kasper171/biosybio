import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef, useState } from "react";
import type { Profile } from "@/lib/profile-storage";
import {
  incrementProfileView,
  hasCountedProfileView,
  markProfileViewCounted,
} from "@/lib/profile-storage";
import { PublicProfileView } from "@/components/PublicProfileView";
import { normalizeProfile } from "@/lib/normalize-profile";
import { attachProfileRoles } from "@/lib/profile-roles";
import { incrementProfileViewFn } from "@/lib/profile/profile-view.functions";
import { buildProfileShareMeta, resolveShareEmbedTitle } from "@/lib/share-embed";

type ProfileShareEmbedRow = {
  username: string;
  share_embed_title: string | null;
  share_embed_description: string | null;
  share_embed_image_url: string | null;
};

export const Route = createFileRoute("/$username")({
  loader: async ({ params }) => {
    // Loader roda no client também (navegação SPA). Só busque embed no servidor,
    // senão o bundle do client tenta puxar supabaseAdmin e quebra (erro até dar F5).
    if (!import.meta.env.SSR) return null;
    const { fetchProfileShareEmbed } = await import("@/lib/profile/profile-embed.server");
    return fetchProfileShareEmbed(params.username);
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Biosy — Your world. Your profile. Your way." }] };
    return { meta: buildProfileShareMeta(params.username, loaderData) };
  },
  component: PublicProfile,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center text-center">
      <div>
        <h1 className="text-3xl font-bold">Profile not found</h1>
        <p className="mt-2 text-white/60">This user doesn't exist yet.</p>
        <Link to="/" className="mt-4 inline-block text-pink-500 hover:underline">
          Go back
        </Link>
      </div>
    </div>
  ),
});

function PublicProfile() {
  const { username } = Route.useParams();
  const shareEmbed = Route.useLoaderData();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notfound, setNotfound] = useState(false);
  const [loading, setLoading] = useState(true);
  const viewTrackedRef = useRef(false);

  useEffect(() => {
    viewTrackedRef.current = false;
    setLoading(true);
    setProfile(null);
    setNotfound(false);
  }, [username]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setNotfound(true);
        setLoading(false);
        return;
      }

      const profileData = normalizeProfile(data as Record<string, unknown>);
      const withRoles = await attachProfileRoles(profileData);
      if (cancelled) return;

      const shouldCount =
        withRoles.show_view_count !== false &&
        !viewTrackedRef.current &&
        !hasCountedProfileView(withRoles.id);

      let finalProfile = withRoles;

      if (shouldCount) {
        viewTrackedRef.current = true;
        markProfileViewCounted(withRoles.id);

        const result = await incrementProfileViewFn({
          data: { profileId: withRoles.id },
        });

        if (result.ok && result.viewCount !== null) {
          finalProfile = { ...withRoles, view_count: result.viewCount };
        } else {
          const fallbackCount = await incrementProfileView(withRoles.id);
          if (fallbackCount !== null) {
            finalProfile = { ...withRoles, view_count: fallbackCount };
          }
        }
      }

      setProfile(finalProfile);
      setLoading(false);
      document.title = resolveShareEmbedTitle(finalProfile);
    })();

    return () => {
      cancelled = true;
    };
  }, [username]);

  useEffect(() => {
    if (!shareEmbed) return;
    document.title = resolveShareEmbedTitle(shareEmbed);
  }, [shareEmbed]);

  if (notfound) throw notFound();

  if (loading || !profile) {
    return <div className="grid min-h-screen place-items-center text-white/60">Loading...</div>;
  }

  return <PublicProfileView profile={profile} onProfileChange={setProfile} />;
}
