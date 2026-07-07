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

export const Route = createFileRoute("/$username")({
  ssr: false,
  component: PublicProfile,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center text-center">
      <div>
        <h1 className="text-3xl font-bold">Perfil não encontrado</h1>
        <p className="mt-2 text-white/60">Este usuário ainda não existe.</p>
        <Link to="/" className="mt-4 inline-block text-pink-500 hover:underline">Voltar</Link>
      </div>
    </div>
  ),
});

function PublicProfile() {
  const { username } = Route.useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notfound, setNotfound] = useState(false);
  const viewTrackedRef = useRef(false);

  useEffect(() => {
    viewTrackedRef.current = false;
  }, [username]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("profiles").select("*").eq("username", username).maybeSingle();
      if (cancelled) return;
      if (error || !data) { setNotfound(true); return; }

      let profileData = normalizeProfile(data as Record<string, unknown>);

      const shouldCount =
        profileData.show_view_count !== false &&
        !viewTrackedRef.current &&
        !hasCountedProfileView(profileData.id);

      if (shouldCount) {
        viewTrackedRef.current = true;
        markProfileViewCounted(profileData.id);
        const newCount = await incrementProfileView(profileData.id);
        if (!cancelled && newCount !== null) {
          profileData = { ...profileData, view_count: newCount };
        }
      }

      if (!cancelled) {
        const withRoles = await attachProfileRoles(profileData);
        setProfile(withRoles);
        document.title = `${withRoles.display_name || username} — Biosy`;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [username]);

  if (notfound) throw notFound();
  if (!profile) return <div className="grid min-h-screen place-items-center text-white/60">Carregando...</div>;

  return <PublicProfileView profile={profile} />;
}
