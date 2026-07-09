import { useCallback, useEffect, useRef, useState } from "react";
import type { AlbumBlock, AlbumTheme } from "@/features/album/types/album.types";
import {
  fetchAlbumLayoutFn,
  saveAlbumLayoutFn,
} from "@/features/album/services/album.functions";

const SAVE_DEBOUNCE_MS = 800;

export function useAlbumLayout() {
  const [layout, setLayout] = useState<AlbumBlock[]>([]);
  const [theme, setTheme] = useState<AlbumTheme>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ layout: AlbumBlock[]; theme: AlbumTheme } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await fetchAlbumLayoutFn();
        if (cancelled) return;
        setLayout((result.layout as AlbumBlock[]) ?? []);
        setTheme((result.theme as AlbumTheme) ?? {});
        setLastSavedAt(result.updated_at);
      } catch {
        if (!cancelled) setError("Could not load album layout.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const flushSave = useCallback(async () => {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    setSaving(true);
    setError(null);
    try {
      const result = await saveAlbumLayoutFn({
        data: { layout: pending.layout, theme: pending.theme },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setLastSavedAt(new Date().toISOString());
    } catch {
      setError("Could not save layout.");
    } finally {
      setSaving(false);
    }
  }, []);

  const scheduleSave = useCallback(
    (nextLayout: AlbumBlock[], nextTheme: AlbumTheme) => {
      pendingRef.current = { layout: nextLayout, theme: nextTheme };
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void flushSave();
      }, SAVE_DEBOUNCE_MS);
    },
    [flushSave],
  );

  const updateLayout = useCallback(
    (next: AlbumBlock[] | ((prev: AlbumBlock[]) => AlbumBlock[])) => {
      setLayout((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        scheduleSave(resolved, theme);
        return resolved;
      });
    },
    [scheduleSave, theme],
  );

  const updateTheme = useCallback(
    (next: AlbumTheme | ((prev: AlbumTheme) => AlbumTheme)) => {
      setTheme((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        scheduleSave(layout, resolved);
        return resolved;
      });
    },
    [layout, scheduleSave],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    layout,
    theme,
    loading,
    saving,
    error,
    lastSavedAt,
    setLayout: updateLayout,
    setTheme: updateTheme,
    flushSave,
  };
}
