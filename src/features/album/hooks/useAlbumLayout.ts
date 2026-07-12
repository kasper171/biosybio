import { useCallback, useEffect, useRef, useState } from "react";
import type { AlbumBlock, AlbumTheme } from "@/features/album/types/album.types";
import {
  fetchAlbumLayoutFn,
  saveAlbumLayoutFn,
} from "@/features/album/services/album.functions";

const SAVE_DEBOUNCE_MS = 800;

export type AlbumLayoutSaveResult =
  | { ok: true }
  | { ok: false; error: string };

export function useAlbumLayout() {
  const [layout, setLayout] = useState<AlbumBlock[]>([]);
  const [theme, setTheme] = useState<AlbumTheme>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const layoutRef = useRef<AlbumBlock[]>([]);
  const themeRef = useRef<AlbumTheme>({});

  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await fetchAlbumLayoutFn();
        if (cancelled) return;
        const nextLayout = (result.layout as AlbumBlock[]) ?? [];
        const nextTheme = (result.theme as AlbumTheme) ?? {};
        layoutRef.current = nextLayout;
        themeRef.current = nextTheme;
        setLayout(nextLayout);
        setTheme(nextTheme);
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

  const flushSave = useCallback(async (): Promise<AlbumLayoutSaveResult> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const snapshot = {
      layout: layoutRef.current,
      theme: themeRef.current,
    };

    setSaving(true);
    setError(null);
    try {
      const result = await saveAlbumLayoutFn({
        data: { layout: snapshot.layout, theme: snapshot.theme },
      });
      if (!result.ok) {
        const message = result.error ?? "Could not save layout.";
        setError(message);
        return { ok: false as const, error: message };
      }
      setLastSavedAt(new Date().toISOString());
      return { ok: true as const };
    } catch {
      const message = "Could not save layout.";
      setError(message);
      return { ok: false as const, error: message };
    } finally {
      setSaving(false);
    }
  }, []);

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void flushSave();
    }, SAVE_DEBOUNCE_MS);
  }, [flushSave]);

  const updateLayout = useCallback(
    (next: AlbumBlock[] | ((prev: AlbumBlock[]) => AlbumBlock[])) => {
      setLayout((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        layoutRef.current = resolved;
        scheduleSave();
        return resolved;
      });
    },
    [scheduleSave],
  );

  const updateTheme = useCallback(
    (next: AlbumTheme | ((prev: AlbumTheme) => AlbumTheme)) => {
      setTheme((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        themeRef.current = resolved;
        scheduleSave();
        return resolved;
      });
    },
    [scheduleSave],
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
