import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/profile-storage";
import { profilePublicUrl } from "@/lib/site";
import { useAlbumLayout } from "@/features/album/hooks/useAlbumLayout";
import { AlbumEditor } from "@/features/album/components/editor/AlbumEditor";
import { AlbumThemePanel } from "@/features/album/components/editor/AlbumThemePanel";
import { AlbumConnectionsPanel } from "@/features/album/components/editor/AlbumConnectionsPanel";
import { AlbumI18nProvider, useAlbumI18n } from "@/features/album/i18n/album-messages";
import type { AlbumConnectionsRow } from "@/features/album/types/album.types";
import { fetchAlbumConnectionsClient } from "@/features/album/services/albumSupabaseService";

type Tab = "layout" | "theme" | "connections";

function AlbumStudioInner() {
  const { t } = useAlbumI18n();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<Tab>("layout");
  const tabLabels: Record<Tab, string> = {
    layout: t("album.studio.tabLayout"),
    theme: t("album.studio.tabTheme"),
    connections: t("album.studio.tabConnections"),
  };
  const [connections, setConnections] = useState<AlbumConnectionsRow | null>(null);
  const { layout, theme, setLayout, setTheme, loading, saving, lastSavedAt } = useAlbumLayout();

  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: row } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
      if (row) setProfile(row as Profile);
      setConnections(await fetchAlbumConnectionsClient(data.user.id));
    });
  }, []);

  if (loading || !profile) {
    return <div className="album-page flex min-h-screen items-center justify-center text-white/50">Carregando…</div>;
  }

  return (
    <div className="album-page album-studio">
      <header className="album-studio__header">
        <div>
          <h1 className="text-lg font-bold">{t("album.studio.title")}</h1>
          <p className="text-xs text-white/40">
            {saving ? t("album.studio.saving") : lastSavedAt ? t("album.studio.saved") : ""}
          </p>
        </div>
        <Link
          to={profilePublicUrl(profile.username) as "/"}
          className="album-btn album-btn--primary gap-2"
          target="_blank"
        >
          {t("album.studio.preview")}
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </header>

      <nav className="album-studio__tabs">
        {(["layout", "theme", "connections"] as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            className={`album-studio__tab ${tab === key ? "album-studio__tab--active" : ""}`}
            onClick={() => setTab(key)}
          >
            {tabLabels[key]}
          </button>
        ))}
        <Link to="/dashboard/estilo" className="album-studio__tab mt-4 text-center">
          Trocar estilo
        </Link>
      </nav>

      <main className="album-studio__main">
        {tab === "layout" ? (
          <AlbumEditor
            blocks={layout}
            theme={theme}
            userId={profile.id}
            connections={connections}
            onBlocksChange={setLayout}
          />
        ) : null}
        {tab === "theme" ? <AlbumThemePanel theme={theme} onChange={setTheme} /> : null}
        {tab === "connections" ? <AlbumConnectionsPanel userId={profile.id} /> : null}
      </main>
    </div>
  );
}

export function AlbumStudio() {
  return (
    <AlbumI18nProvider>
      <AlbumStudioInner />
    </AlbumI18nProvider>
  );
}
