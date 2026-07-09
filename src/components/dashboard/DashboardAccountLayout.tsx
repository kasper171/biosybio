import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import {
  AtSign,
  BarChart3,
  ExternalLink,
  Image as ImageIcon,
  Paintbrush,
  LayoutGrid,
  LayoutDashboard,
  LayoutTemplate,
  Link2,
  LogOut,
  Layers,
  MessageSquare,
  Music2,
  Palette,
  Share2,
  Shield,
  Sparkles,
  Tag,
  User,
  Frame,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/profile-storage";
import { profilePublicUrl, SITE_NAME } from "@/lib/site";
import {
  DASHBOARD_TEXT_SCALE_DEFAULT,
  getDashboardTextScale,
  type DashboardTextScale,
} from "@/lib/dashboard-text-scale";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

export type AccountSection =
  | "overview"
  | "estatisticas"
  | "privacidade"
  | "miscellaneous"
  | "templates"
  | "personalizar";

export type PersonalizePanelKey =
  | "perfil"
  | "midia"
  | "audio"
  | "blocos"
  | "aparencia"
  | "molduras"
  | "efeitos"
  | "colors"
  | "redes"
  | "etiquetas"
  | "overlays"
  | "conexoes"
  | "comentarios";

type NavLink = {
  id: string;
  label: string;
  icon: LucideIcon;
  to: "/dashboard";
  search?: {
    view?: "personalizar";
    panel?: PersonalizePanelKey;
    section?: "estatisticas" | "privacidade" | "miscellaneous" | "templates";
  };
  active?: boolean;
};

const PERSONALIZE_PANEL_DEFS: { key: PersonalizePanelKey; icon: LucideIcon }[] = [
  { key: "perfil", icon: User },
  { key: "midia", icon: ImageIcon },
  { key: "audio", icon: Music2 },
  { key: "blocos", icon: LayoutGrid },
  { key: "aparencia", icon: Palette },
  { key: "molduras", icon: Frame },
  { key: "efeitos", icon: Sparkles },
  { key: "colors", icon: Paintbrush },
  { key: "redes", icon: Link2 },
  { key: "etiquetas", icon: Tag },
  { key: "overlays", icon: Layers },
  { key: "conexoes", icon: Link2 },
  { key: "comentarios", icon: MessageSquare },
];

export function usePersonalizePanels() {
  const { t } = useI18n();
  return PERSONALIZE_PANEL_DEFS.map((panel) => ({
    ...panel,
    label: t(`dashboard.layout.panels.${panel.key}`),
  }));
}

/** @deprecated Use usePersonalizePanels() */
export const PERSONALIZE_PANELS = PERSONALIZE_PANEL_DEFS.map((p) => ({
  ...p,
  label: p.key,
}));

type Props = {
  profile: Profile;
  activeSection?: AccountSection;
  activePanel?: PersonalizePanelKey;
  headerSlot?: React.ReactNode;
  children?: React.ReactNode;
  /** Sidebar sobrepõe o preview em tela cheia (modo personalizar). */
  overlay?: boolean;
};

export function DashboardAccountLayout({
  profile,
  activeSection = "overview",
  activePanel,
  headerSlot,
  children,
  overlay = false,
}: Props) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const personalizePanels = usePersonalizePanels();
  const [textScale, setTextScale] = useState<DashboardTextScale>(DASHBOARD_TEXT_SCALE_DEFAULT);

  useEffect(() => {
    setTextScale(getDashboardTextScale());
  }, []);

  const displayName = profile.display_name || profile.username;
  const isPersonalizar = activeSection === "personalizar";
  /** No studio: Painel vira pai e demais itens ficam como sub-opções compactas. */
  const isStudioCompact = isPersonalizar || overlay;

  const contaLinks: NavLink[] = useMemo(
    () => [
      {
        id: "overview",
        label: t("dashboard.layout.nav.dashboard"),
        icon: LayoutDashboard,
        to: "/dashboard",
        active: activeSection === "overview",
      },
      {
        id: "stats",
        label: t("dashboard.layout.nav.analytics"),
        icon: BarChart3,
        to: "/dashboard",
        search: { section: "estatisticas" },
        active: activeSection === "estatisticas",
      },
      {
        id: "templates",
        label: t("dashboard.layout.nav.templates"),
        icon: LayoutTemplate,
        to: "/dashboard",
        search: { section: "templates" },
        active: activeSection === "templates",
      },
      {
        id: "privacidade",
        label: t("dashboard.layout.nav.account"),
        icon: Shield,
        to: "/dashboard",
        search: { section: "privacidade" },
        active: activeSection === "privacidade",
      },
      {
        id: "miscellaneous",
        label: t("dashboard.layout.nav.miscellaneous"),
        icon: Sparkles,
        to: "/dashboard",
        search: { section: "miscellaneous" },
        active: activeSection === "miscellaneous",
      },
    ],
    [activeSection, t],
  );

  const painelLink = contaLinks[0]!;
  const painelSubLinks = contaLinks.slice(1);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const handleShare = async () => {
    const url = profilePublicUrl(profile.username);
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("dashboard.toasts.linkCopied"));
    } catch {
      toast.error(t("dashboard.toasts.linkCopyFailed"));
    }
  };

  return (
    <div
      className={`biosy-dash ${overlay ? "contents" : "min-h-screen bg-background text-white"}`}
      data-text-scale={textScale}
    >
      <aside
        className={`biosy-dashboard-shell fixed inset-y-0 left-0 z-40 flex w-[var(--dash-sidebar-w)] flex-col border-r ${
          overlay ? "shadow-none" : ""
        }`}
      >
        <div className="border-b border-white/[0.06] px-5 py-5">
          <Link to="/" className="dash-t-heading font-bold tracking-tight text-white">
            {SITE_NAME}
          </Link>
        </div>

        <nav className="biosy-nav-no-scrollbar min-h-0 flex-1 px-3 py-4">
          <p className="dash-t-section mb-2 px-3 font-semibold uppercase tracking-wider text-white/30">
            {t("dashboard.layout.navigation")}
          </p>
          <LayoutGroup id="dashboard-sidebar-nav">
            <div className="mb-6 space-y-0.5">
              <AnimatePresence mode="popLayout" initial={false}>
                {isStudioCompact ? (
                  <motion.div
                    key="nav-studio-compact"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="space-y-0.5"
                  >
                    <SidebarLink item={painelLink} compact={overlay} />
                    <motion.div
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div
                        className="relative ml-[1.125rem] border-l border-white/12 py-0.5 pl-2.5"
                        aria-label={t("dashboard.layout.nav.dashboard")}
                      >
                        {painelSubLinks.map((item) => (
                          <SidebarLink key={item.id} item={item} variant="sub" />
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="nav-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="space-y-0.5"
                  >
                    {contaLinks.map((item) => (
                      <SidebarLink key={item.id} item={item} compact={overlay} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </LayoutGroup>

          <p className="dash-t-section mb-2 px-3 font-semibold uppercase tracking-wider text-white/30">
            {t("dashboard.layout.studio")}
          </p>
          <div className="mb-4 space-y-0.5">
            {isPersonalizar ? (
              personalizePanels.map((panel) => (
                <SidebarLink
                  key={panel.key}
                  compact={overlay}
                  item={{
                    id: panel.key,
                    label: panel.label,
                    icon: panel.icon,
                    to: "/dashboard",
                    search: { view: "personalizar", panel: panel.key },
                    active: activePanel === panel.key,
                  }}
                />
              ))
            ) : (
              <SidebarLink
                compact={overlay}
                item={{
                  id: "personalizar",
                  label: t("dashboard.layout.nav.openEditor"),
                  icon: Palette,
                  to: "/dashboard",
                  search: { view: "personalizar", panel: "perfil" },
                  active: false,
                }}
              />
            )}
          </div>
        </nav>

        <div className="border-t border-white/[0.06] p-3">
          {!overlay && (
            <>
              <div className="mb-3 px-1">
                <LanguageSwitcher fullWidth />
              </div>
              <div className="mb-2 space-y-0.5">
                <Link
                  to="/$username"
                  params={{ username: profile.username }}
                  target="_blank"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 dash-t-body text-white/60 transition hover:bg-white/[0.04] hover:text-white"
                >
                  <ExternalLink className="dash-icon-md" />
                  {t("dashboard.layout.footer.myPage")}
                </Link>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 dash-t-body text-white/60 transition hover:bg-white/[0.04] hover:text-white"
                >
                  <Share2 className="dash-icon-md" />
                  {t("dashboard.layout.footer.shareLink")}
                </button>
              </div>
            </>
          )}

          <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <User className="dash-icon-md text-white/40" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate dash-t-body font-medium text-white">{displayName}</p>
              <p className="truncate dash-t-caption text-white/40">
                @{profile.username}
                {profile.public_uid != null && (
                  <span className="text-white/25"> · #{profile.public_uid}</span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 rounded-lg p-1.5 text-white/35 transition hover:bg-white/10 hover:text-white"
              title="Log out"
            >
              <LogOut className="dash-icon-sm" />
            </button>
          </div>
        </div>
      </aside>

      {!overlay && (
        <main className="biosy-scrollbar ml-[var(--dash-sidebar-w)] min-h-screen overflow-y-auto p-6 lg:p-8">
          {headerSlot}
          {children}
        </main>
      )}
    </div>
  );
}

const NAV_LAYOUT_TRANSITION = { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const };

function SidebarLink({
  item,
  compact = false,
  variant = "full",
}: {
  item: NavLink;
  compact?: boolean;
  variant?: "full" | "sub";
}) {
  const Icon = item.icon;
  const isSub = variant === "sub";

  const className = cn(
    "relative flex w-full min-w-0 items-center rounded-lg transition",
    isSub
      ? "gap-1.5 py-1 pl-1 pr-2 text-[11px] leading-snug"
      : cn("gap-2.5 px-3 dash-t-body", compact ? "py-1.5" : "py-2"),
    item.active
      ? isSub
        ? "font-medium text-white/90"
        : "bg-white/[0.05] font-medium text-white before:absolute before:inset-y-2 before:left-0 before:w-[2px] before:rounded-full before:bg-white/50"
      : isSub
        ? "text-white/40 hover:bg-white/[0.03] hover:text-white/75"
        : "text-white/50 hover:bg-white/[0.03] hover:text-white/85",
  );

  const linkContent = (
    <>
      <Icon className={cn("shrink-0", isSub ? "h-3 w-3" : "dash-icon-md")} />
      <span className="truncate">{item.label}</span>
    </>
  );

  const linkEl = item.search ? (
    <Link to={item.to} search={item.search} className={className}>
      {linkContent}
    </Link>
  ) : (
    <Link to={item.to} className={className}>
      {linkContent}
    </Link>
  );

  return (
    <motion.div
      layout
      layoutId={`dash-nav-${item.id}`}
      transition={NAV_LAYOUT_TRANSITION}
    >
      {linkEl}
    </motion.div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: typeof AtSign;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[var(--biosy-shell)] p-5 lg:p-6">
      <div className="mb-4 flex items-start justify-between">
        <p className="dash-t-body text-white/45">{label}</p>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05]">
          <Icon className="dash-icon-md text-white/50" />
        </div>
      </div>
      <p className="dash-t-stat font-bold tracking-tight text-white">{value}</p>
      {sub && <div className="mt-2 dash-t-caption text-white/40">{sub}</div>}
    </div>
  );
}

export function DashCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/[0.06] bg-[var(--biosy-shell)] ${className}`}>
      {title && (
        <div className="border-b border-white/[0.06] px-5 py-4 lg:px-6 lg:py-5">
          <h2 className="dash-t-title font-semibold text-white">{title}</h2>
        </div>
      )}
      <div className="p-5 lg:p-6">{children}</div>
    </div>
  );
}
