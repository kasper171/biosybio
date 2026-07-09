import { useMemo, useState, useEffect, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, Eye, PanelLeftClose, Save, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/lib/profile-storage";
import {
  DashboardAccountLayout,
  type AlbumStudioPanelKey,
} from "@/components/dashboard/DashboardAccountLayout";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/LocaleProvider";
import type { DashboardTextScale } from "@/lib/dashboard-text-scale";
import { AlbumGrid } from "@/features/album/components/editor/AlbumGrid";
import { AlbumLayoutToolsPanel } from "@/features/album/components/editor/AlbumLayoutToolsPanel";
import { AlbumThemePanel } from "@/features/album/components/editor/AlbumThemePanel";
import { AlbumConnectionsPanel } from "@/features/album/components/editor/AlbumConnectionsPanel";
import { AlbumStudioLayout } from "@/features/album/components/public/AlbumProfileSidebar";
import { AlbumPageExperience } from "@/features/album/components/public/AlbumPageExperience";
import { AlbumI18nProvider, useAlbumI18n } from "@/features/album/i18n/album-messages";
import { useAlbumLayout } from "@/features/album/hooks/useAlbumLayout";
import { useAlbumStudioPanels } from "@/features/album/hooks/useAlbumStudioPanels";
import { useAlbumStyle } from "@/features/album/hooks/useAlbumStyle";
import { resolveAlbumConnections } from "@/features/album/lib/resolve-album-connections";
import { albumPageStyle } from "@/features/album/lib/effects/album-profile-colors";
import { MoldurasPanel } from "@/components/dashboard/MoldurasPanel";
import { OverlaysPanel } from "@/components/dashboard/OverlaysPanel";

const TOOLS_PANEL_WIDTH = 360;

type Props = {
  profile: Profile;
  textScale: DashboardTextScale;
  toolsOpen: boolean;
  setToolsPanelOpen: (open: boolean) => void;
  openPanel: AlbumStudioPanelKey;
  onShareLink: () => void;
  onProfileChange: (profile: Profile) => void;
  onSaveProfile: () => Promise<void>;
  renderProfilePanel?: (panel: AlbumStudioPanelKey) => ReactNode;
};

function AlbumPersonalizarShellInner({
  profile: profileProp,
  textScale,
  toolsOpen,
  setToolsPanelOpen,
  openPanel,
  onShareLink,
  onProfileChange,
  onSaveProfile,
  renderProfilePanel,
}: Props) {
  const { t: dashT } = useI18n();
  const { t: albumT } = useAlbumI18n();
  const albumPanels = useAlbumStudioPanels();
  const { saveStyle } = useAlbumStyle();
  const { layout, theme, setLayout, setTheme, saving, flushSave } = useAlbumLayout();
  const [profile, setProfile] = useState(profileProp);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => {
    setProfile(profileProp);
  }, [profileProp]);

  const connections = useMemo(() => resolveAlbumConnections(profile), [profile]);

  const updateProfile = <K extends keyof Profile>(k: K, v: Profile[K]) => {
    setProfile((p) => {
      const next = { ...p, [k]: v };
      onProfileChange(next);
      return next;
    });
  };

  const panelLabel =
    albumPanels.find((p) => p.key === openPanel)?.label ?? albumT("album.studio.tabLayout");

  const handleSave = async () => {
    setSavingAll(true);
    try {
      const styleResult = await saveStyle("album");
      if (!styleResult.ok) {
        toast.error(styleResult.error ?? "Não foi possível salvar o estilo Álbum.");
        return;
      }
      await flushSave();
      await onSaveProfile();
      toast.success(albumT("album.studio.saved"));
    } finally {
      setSavingAll(false);
    }
  };

  const pageStyle = albumPageStyle(theme);

  return (
    <div
      className="biosy-dash relative min-h-screen overflow-hidden"
      data-text-scale={textScale}
      style={{ ["--dash-tools-w" as string]: `${TOOLS_PANEL_WIDTH}px` }}
    >
      <motion.div
        className="absolute inset-0 overflow-auto album-dash-preview"
        animate={{
          marginLeft: toolsOpen
            ? `calc(var(--dash-sidebar-w) + ${TOOLS_PANEL_WIDTH}px)`
            : "var(--dash-sidebar-w)",
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <AlbumPageExperience
          profile={profile}
          isEditor
          onProfileChange={(next) => {
            setProfile(next);
            onProfileChange(next);
          }}
        >
          <div className="album-public-view min-h-full" style={pageStyle}>
            <div className="album-public-view__inner px-4 py-8 lg:px-8">
              <AlbumStudioLayout profile={profile} theme={theme} connections={connections}>
                <AlbumGrid
                  blocks={layout}
                  theme={theme}
                  mode="edit"
                  profile={profile}
                  userId={profile.id}
                  connections={connections}
                  selectedId={selectedBlockId}
                  onSelect={setSelectedBlockId}
                  onLayoutChange={setLayout}
                />
              </AlbumStudioLayout>
            </div>
          </div>
        </AlbumPageExperience>
      </motion.div>

      <DashboardAccountLayout
        overlay
        profile={profile}
        activeSection="personalizar"
        studioMode="album"
        activeAlbumPanel={openPanel}
      />

      <motion.aside
        key="album-tools-panel"
        initial={false}
        animate={{ x: toolsOpen ? 0 : -TOOLS_PANEL_WIDTH - 8 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="biosy-dashboard-shell fixed inset-y-0 left-[var(--dash-sidebar-w)] z-30 flex flex-col border-r"
        style={{ width: TOOLS_PANEL_WIDTH }}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.05] px-4 py-3">
          <h2 className="min-w-0 truncate dash-t-body font-semibold text-white">{panelLabel}</h2>
          <button
            type="button"
            onClick={() => setToolsPanelOpen(false)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-white/55 transition hover:bg-white/[0.06] hover:text-white"
            title={dashT("dashboard.editor.minimizeTools")}
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{dashT("dashboard.editor.minimize")}</span>
          </button>
        </div>
        <div className="biosy-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={openPanel}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              {openPanel === "album-layout" ? (
                <AlbumLayoutToolsPanel
                  blocks={layout}
                  onBlocksChange={setLayout}
                  selectedId={selectedBlockId}
                  onSelect={setSelectedBlockId}
                />
              ) : null}
              {openPanel === "album-theme" ? (
                <AlbumThemePanel theme={theme} onChange={setTheme} />
              ) : null}
              {openPanel === "album-connections" ? (
                <AlbumConnectionsPanel
                  profile={profile}
                  theme={theme}
                  onThemeChange={setTheme}
                  update={updateProfile}
                  onBatchUpdate={(patch) => {
                    setProfile((p) => {
                      const next = { ...p, ...patch };
                      onProfileChange(next);
                      return next;
                    });
                  }}
                />
              ) : null}
              {openPanel === "molduras" ? (
                <MoldurasPanel profile={profile} update={updateProfile} />
              ) : null}
              {openPanel === "overlays" ? (
                <OverlaysPanel profile={profile} update={updateProfile} />
              ) : null}
              {renderProfilePanel?.(openPanel)}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.aside>

      {!toolsOpen ? (
        <button
          type="button"
          onClick={() => setToolsPanelOpen(true)}
          className="biosy-tools-reveal-tab group"
          title={dashT("dashboard.editor.openTools")}
          aria-label={dashT("dashboard.editor.openTools")}
        >
          <span className="biosy-tools-reveal-glow" aria-hidden />
          <span className="biosy-tools-reveal-ring" aria-hidden />
          <ChevronRight className="biosy-tools-reveal-icon relative z-[2] h-[18px] w-[18px]" strokeWidth={2.25} />
        </button>
      ) : null}

      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-end p-4"
        style={{
          paddingLeft: toolsOpen
            ? `calc(var(--dash-sidebar-w) + ${TOOLS_PANEL_WIDTH}px + 1rem)`
            : "calc(var(--dash-sidebar-w) + 1rem)",
        }}
      >
        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
          <LanguageSwitcher compact className="biosy-dashboard-shell border-white/[0.06] bg-transparent" />
          <button
            type="button"
            onClick={onShareLink}
            className="biosy-dashboard-shell flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/[0.04]"
          >
            <Share2 className="h-3.5 w-3.5" />
            {dashT("dashboard.layout.footer.shareLink")}
          </button>
          <Link
            to="/$username"
            params={{ username: profile.username }}
            target="_blank"
            className="biosy-dashboard-shell flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/[0.04]"
          >
            <Eye className="h-3.5 w-3.5" />
            {dashT("dashboard.layout.footer.myPage")}
          </Link>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || savingAll}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.08] px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.12] disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving || savingAll ? albumT("album.studio.saving") : dashT("dashboard.editor.save")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function AlbumPersonalizarShell(props: Props) {
  return (
    <AlbumI18nProvider>
      <AlbumPersonalizarShellInner {...props} />
    </AlbumI18nProvider>
  );
}
