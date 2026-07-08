import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cleanUsername } from "@/lib/username";
import { ensureLivePublicTemplateIfEnabled } from "@/lib/profile-template";
import { normalizeProfile } from "@/lib/normalize-profile";
import type { Profile } from "@/lib/profile-storage";

export function useDashboardProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        if (active) setLoading(false);
        return;
      }
      if (active) setUserId(u.user.id);

      const applyProfile = async (row: Record<string, unknown>) => {
        const p = normalizeProfile(row);
        if (active) setProfile(p);
        await ensureLivePublicTemplateIfEnabled(p);
      };

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.user.id)
        .maybeSingle();
      if (error) toast.error(error.message);

      if (data) {
        await applyProfile(data as Record<string, unknown>);
        if (active) setLoading(false);
        return;
      }

      for (let attempt = 0; attempt < 4; attempt++) {
        await new Promise((r) => setTimeout(r, 350));
        const { data: retry, error: retryErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", u.user.id)
          .maybeSingle();
        if (retryErr) {
          toast.error(retryErr.message);
          break;
        }
        if (retry) {
          await applyProfile(retry as Record<string, unknown>);
          if (active) setLoading(false);
          return;
        }
      }

      const fallbackUser =
        (u.user.user_metadata?.username as string | undefined) ??
        u.user.email?.split("@")[0] ??
        "user";
      const cleanUser = cleanUsername(fallbackUser + u.user.id.slice(0, 4));
      const { error: upsertErr } = await supabase.from("profiles").upsert(
        {
          id: u.user.id,
          username: cleanUser,
          display_name: fallbackUser,
          public_template_enabled: true,
        },
        { onConflict: "id", ignoreDuplicates: true },
      );
      const { data: created, error: fetchErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.user.id)
        .maybeSingle();
      if (fetchErr) toast.error(fetchErr.message);
      else if (created && active) await applyProfile(created as Record<string, unknown>);
      else if (upsertErr) toast.error(upsertErr.message);
      else toast.error("Could not load your profile. Reload the page.");

      if (active) setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const update = <K extends keyof Profile>(k: K, v: Profile[K]) =>
    setProfile((p) => (p ? { ...p, [k]: v } : p));

  return { userId, profile, setProfile, update, loading };
}
