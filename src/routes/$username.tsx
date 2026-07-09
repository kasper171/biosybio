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
import { ensureProfileFontsLoaded } from "@/lib/profile-fonts";
import { incrementProfileViewFn } from "@/lib/profile/profile-view.functions";
import { fetchPublicProfileByUsernameFn } from "@/lib/profile/profile-public.functions";
import { warmupProfileTapVisuals } from "@/lib/profile/profile-visual-preload";
import { buildProfileShareMeta } from "@/lib/share-embed";
import { resolvePageFaviconUrl } from "@/lib/page-meta";
import type { ProfileShareEmbedRow } from "@/lib/profile/profile-embed.server";
import { SITE_TITLE } from "@/lib/site";
import { useI18n } from "@/i18n/LocaleProvider";

function ProfileNotFound() {
  const { t } = useI18n();
  return (
    <SiteStatusPage
      title={t("profile.notFoundTitle")}
      description={t("profile.notFoundDesc")}
      actions={
        <>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))",
            }}
          >
            {t("common.goHome")}
          </Link>
          <SiteStatusOutlineLink href="/auth">{t("profile.createProfile")}</SiteStatusOutlineLink>
        </>
      }
    />
  );
}

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
    return {
      meta: buildProfileShareMeta(params.username, loaderData),
      links: [
        {
          rel: "icon",
          href: resolvePageFaviconUrl(loaderData.page_favicon_url),
        },
      ],
    };
  },
  component: PublicProfile,
  notFoundComponent: ProfileNotFound,
});

function scheduleProfileViewIncrement(
  profile: Profile,
  onViewCount: (count: number) => void,
): void {
  if (hasCountedProfileView(profile.id)) return;

  void incrementProfileViewFn({
    data: {
      profileId: profile.id,
      visitorId: getOrCreateVisitorId(),
    },
  })
    .then((result) => {
      if (!result?.ok) return;
      if (result.skipped) {
        markProfileViewCounted(profile.id);
        if (result.viewCount !== null) onViewCount(result.viewCount);
        return;
      }
      markProfileViewCounted(profile.id);
      if (result.viewCount !== null) {
        onViewCount(result.viewCount);
      }
    })
    .catch((error) => {
      console.warn("[scheduleProfileViewIncrement]", error);
    });
}

function PublicProfile() {
  const { username } = Route.useParams();
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

      const [withRoles] = await Promise.all([
        attachProfileRoles(profileData),
        warmupProfileTapVisuals(profileData),
      ]);
      if (cancelled) return;

      setProfile(withRoles);
      setLoading(false);

      void ensureProfileFontsLoaded(
        withRoles.page_font_family ?? "",
        withRoles.name_font_family ?? "inherit",
      );

      if (!viewTrackedRef.current) {
        viewTrackedRef.current = true;
        scheduleProfileViewIncrement(withRoles, (viewCount) => {
          if (cancelled) return;
          setProfile((prev) => (prev ? { ...prev, view_count: viewCount } : prev));
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [username]);

  if (notfound) throw notFound();

  if (loading || !profile) {
    return <div className="grid min-h-screen place-items-center text-white/60">Loading...</div>;
  }

  return <PublicProfileView profile={profile} onProfileChange={setProfile} />;
}
