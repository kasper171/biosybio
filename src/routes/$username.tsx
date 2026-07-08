import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { Profile } from "@/lib/profile-storage";
import {
  hasCountedProfileView,
  markProfileViewCounted,
  getOrCreateVisitorId,
} from "@/lib/profile-views";
import { PublicProfileView } from "@/components/PublicProfileView";
import {
  SiteStatusOutlineLink,
  SiteStatusPage,
} from "@/components/errors/SiteStatusPage";
import { normalizeProfile } from "@/lib/normalize-profile";
import { attachProfileRoles } from "@/lib/profile-roles";
import { incrementProfileViewFn } from "@/lib/profile/profile-view.functions";
import { fetchPublicProfileByUsernameFn } from "@/lib/profile/profile-public.functions";
import { buildProfileShareMeta, resolveShareEmbedTitle } from "@/lib/share-embed";
import { SITE_TITLE } from "@/lib/site";

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
    if (!loaderData) return { meta: [{ title: SITE_TITLE }] };
    return { meta: buildProfileShareMeta(params.username, loaderData) };
  },
  component: PublicProfile,
  notFoundComponent: () => (
    <SiteStatusPage
      title="Profile not found"
      description="This user doesn't exist yet."
      actions={
        <>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))",
            }}
          >
            Go home
          </Link>
          <SiteStatusOutlineLink href="/auth">Create your profile</SiteStatusOutlineLink>
        </>
      }
    />
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
      const data = await fetchPublicProfileByUsernameFn({
        data: { username },
      });
      if (cancelled) return;
      if (!data) {
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
          data: {
            profileId: withRoles.id,
            visitorId: getOrCreateVisitorId(),
          },
        });

        if (result.ok && result.viewCount !== null) {
          finalProfile = { ...withRoles, view_count: result.viewCount };
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
