import { useCallback, useEffect, useState } from "react";
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
        if (!cancelled) setError("Could not load style.");
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
      if (!result.ok) {
        setError(result.error);
        return false;
      }
      setStyle(next);
      return true;
    } catch {
      setError("Could not save style.");
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { style, loading, saving, error, saveStyle };
}
