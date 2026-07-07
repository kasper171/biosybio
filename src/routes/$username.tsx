import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Profile } from "@/lib/profile-storage";
import {
  incrementProfileView,
  hasCountedProfileView,
  markProfileViewCounted,
} from "@/lib/profile-storage";
import { PublicProfileView } from "@/components/PublicProfileView";
import { ProfileViewGate } from "@/components/ProfileViewGate";
import { normalizeProfile } from "@/lib/normalize-profile";
import { attachProfileRoles } from "@/lib/profile-roles";
import { isTurnstileEnabled } from "@/lib/turnstile/config";
import { incrementProfileViewFn } from "@/lib/turnstile/turnstile.functions";

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

type ViewPhase = "loading" | "turnstile" | "ready";

function PublicProfile() {
  const { username } = Route.useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notfound, setNotfound] = useState(false);
  const [phase, setPhase] = useState<ViewPhase>("loading");
  const pendingProfileRef = useRef<Profile | null>(null);
  const viewTrackedRef = useRef(false);

  useEffect(() => {
    viewTrackedRef.current = false;
    pendingProfileRef.current = null;
    setPhase("loading");
    setProfile(null);
  }, [username]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("profiles").select("*").eq("username", username).maybeSingle();
      if (cancelled) return;
      if (error || !data) { setNotfound(true); return; }

      const profileData = normalizeProfile(data as Record<string, unknown>);
      const withRoles = await attachProfileRoles(profileData);
      if (cancelled) return;

      const shouldCount =
        withRoles.show_view_count !== false &&
        !viewTrackedRef.current &&
        !hasCountedProfileView(withRoles.id);

      if (!shouldCount) {
        setProfile(withRoles);
        setPhase("ready");
        document.title = `${withRoles.display_name || username} — Biosy`;
        return;
      }

      pendingProfileRef.current = withRoles;

      if (isTurnstileEnabled()) {
        setPhase("turnstile");
        document.title = `${withRoles.display_name || username} — Biosy`;
        return;
      }

      viewTrackedRef.current = true;
      markProfileViewCounted(withRoles.id);
      const newCount = await incrementProfileView(withRoles.id);
      const finalProfile =
        newCount !== null ? { ...withRoles, view_count: newCount } : withRoles;
      setProfile(finalProfile);
      setPhase("ready");
      document.title = `${finalProfile.display_name || username} — Biosy`;
    })();

    return () => {
      cancelled = true;
    };
  }, [username]);

  const handleTurnstileToken = useCallback(async (token: string) => {
    const pending = pendingProfileRef.current;
    if (!pending || viewTrackedRef.current) return;

    viewTrackedRef.current = true;
    markProfileViewCounted(pending.id);

    const result = await incrementProfileViewFn({
      data: { profileId: pending.id, token },
    });

    const finalProfile =
      result.ok && result.viewCount !== null
        ? { ...pending, view_count: result.viewCount }
        : pending;

    pendingProfileRef.current = null;
    setProfile(finalProfile);
    setPhase("ready");
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    viewTrackedRef.current = false;
  }, []);

  if (notfound) throw notFound();

  if (phase === "loading") {
    return <div className="grid min-h-screen place-items-center text-white/60">Carregando...</div>;
  }

  if (phase === "turnstile" && pendingProfileRef.current) {
    const pending = pendingProfileRef.current;
    return (
      <ProfileViewGate
        displayName={pending.display_name || username}
        onToken={(token) => void handleTurnstileToken(token)}
        onExpire={handleTurnstileExpire}
      />
    );
  }

  if (!profile) {
    return <div className="grid min-h-screen place-items-center text-white/60">Carregando...</div>;
  }

  return <PublicProfileView profile={profile} />;
}
