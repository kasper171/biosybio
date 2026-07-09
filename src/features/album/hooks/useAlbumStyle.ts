import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileDisplayStyle } from "@/features/album/types/album.types";
import {
  getAlbumDisplayStyleFn,
  saveAlbumDisplayStyleFn,
} from "@/features/album/services/album.functions";

export function useAlbumStyle() {
  const [style, setStyle] = useState<ProfileDisplayStyle>("card");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await getAlbumDisplayStyleFn();
        if (!cancelled) setStyle(result.style);
      } catch {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user && !cancelled) {
          const { data } = await supabase
            .from("profile_display_styles")
            .select("style")
            .eq("user_id", userData.user.id)
            .maybeSingle();
          if (data?.style === "album" || data?.style === "card") {
            setStyle(data.style);
          }
        } else if (!cancelled) {
          setError("Could not load style.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveStyle = useCallback(async (next: ProfileDisplayStyle) => {
    setSaving(true);
    setError(null);

    try {
      const result = await saveAlbumDisplayStyleFn({ data: { style: next } });
      if (result.ok) {
        setStyle(next);
        setSaving(false);
        return true;
      }
      setError(result.error);
    } catch {
      /* fallback to client upsert */
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("Not authenticated.");
      setSaving(false);
      return false;
    }

    const { error: upsertError } = await supabase.from("profile_display_styles").upsert(
      { user_id: userData.user.id, style: next },
      { onConflict: "user_id" },
    );

    setSaving(false);
    if (upsertError) {
      setError(upsertError.message);
      return false;
    }
    setStyle(next);
    return true;
  }, []);

  return { style, loading, saving, error, saveStyle };
}
