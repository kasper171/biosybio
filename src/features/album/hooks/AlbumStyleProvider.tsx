import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileDisplayStyle } from "@/features/album/types/album.types";
import {
  getAlbumDisplayStyleFn,
  saveAlbumDisplayStyleFn,
} from "@/features/album/services/album.functions";

const STORAGE_KEY = "byosy-display-style";

type AlbumStyleContextValue = {
  style: ProfileDisplayStyle;
  loading: boolean;
  saving: boolean;
  error: string | null;
  saveStyle: (next: ProfileDisplayStyle) => Promise<{ ok: true } | { ok: false; error: string }>;
  refreshStyle: () => Promise<void>;
};

const AlbumStyleContext = createContext<AlbumStyleContextValue | null>(null);

function readCachedStyle(): ProfileDisplayStyle | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  return raw === "album" || raw === "card" ? raw : null;
}

function writeCachedStyle(style: ProfileDisplayStyle) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, style);
}

async function readStyleFromClient(userId: string): Promise<ProfileDisplayStyle | null> {
  const { data, error } = await supabase
    .from("profile_display_styles")
    .select("style")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[profile_display_styles]", error.message);
    return null;
  }
  if (data?.style === "album" || data?.style === "card") return data.style;
  return null;
}

async function ensureAlbumLayoutRow(userId: string) {
  const { error } = await supabase.from("album_layouts").upsert(
    { user_id: userId, layout: [], theme: {} },
    { onConflict: "user_id", ignoreDuplicates: true },
  );
  if (error) console.warn("[album_layouts]", error.message);
}

export function AlbumStyleProvider({ children }: { children: ReactNode }) {
  const [style, setStyle] = useState<ProfileDisplayStyle>(() => readCachedStyle() ?? "card");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStyle = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    const fromClient = await readStyleFromClient(userData.user.id);
    if (fromClient) {
      setStyle(fromClient);
      writeCachedStyle(fromClient);
      setLoading(false);
      return;
    }

    try {
      const result = await getAlbumDisplayStyleFn();
      const next = result.style === "album" ? "album" : "card";
      setStyle(next);
      writeCachedStyle(next);
    } catch {
      setError("Could not load style.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshStyle();
  }, [refreshStyle]);

  const saveStyle = useCallback(async (next: ProfileDisplayStyle) => {
    setSaving(true);
    setError(null);
    setStyle(next);
    writeCachedStyle(next);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      const message = "Not authenticated.";
      setError(message);
      setSaving(false);
      return { ok: false as const, error: message };
    }

    let saved = false;

    try {
      const result = await saveAlbumDisplayStyleFn({ data: { style: next } });
      if (result.ok) saved = true;
      else setError(result.error);
    } catch {
      /* server fn unavailable — client upsert below */
    }

    if (!saved) {
      const { error: upsertError } = await supabase.from("profile_display_styles").upsert(
        { user_id: userData.user.id, style: next },
        { onConflict: "user_id" },
      );
      if (upsertError) {
        setError(upsertError.message);
        setSaving(false);
        return { ok: false as const, error: upsertError.message };
      }
      saved = true;
    }

    if (next === "album") {
      await ensureAlbumLayoutRow(userData.user.id);
    }

    setSaving(false);
    return { ok: true as const };
  }, []);

  const value = useMemo(
    () => ({ style, loading, saving, error, saveStyle, refreshStyle }),
    [style, loading, saving, error, saveStyle, refreshStyle],
  );

  return <AlbumStyleContext.Provider value={value}>{children}</AlbumStyleContext.Provider>;
}

export function useAlbumStyle() {
  const ctx = useContext(AlbumStyleContext);
  if (!ctx) throw new Error("useAlbumStyle must be used within AlbumStyleProvider");
  return ctx;
}
