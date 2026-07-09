import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Clock,
  Heart,
  LayoutTemplate,
  Lock,
  Pencil,
  Star,
  Trash2,
  Globe,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/profile-storage";
import {
  applyTemplateToProfile,
  applyThemeToProfile,
  deleteTemplate,
  fetchMyTemplates,
  fetchPublicTemplates,
  toggleTemplateFavorite,
  updateTemplateMeta,
  type ProfileTemplateWithAuthor,
  type TemplateSort,
} from "@/lib/profile-template";
import { DashboardAccountLayout, DashCard } from "@/components/dashboard/DashboardAccountLayout";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/LocaleProvider";

type Tab = "explorar" | "meus";

type Props = {
  profile: Profile;
  onProfileChange: (profile: Profile) => void;
  initialTab?: Tab;
};

const SORT_OPTION_IDS: TemplateSort[] = ["recent", "most_used", "most_favorited"];

export function DashboardTemplatesPage({ profile, onProfileChange, initialTab = "explorar" }: Props) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [sort, setSort] = useState<TemplateSort>("recent");
  const [publicTemplates, setPublicTemplates] = useState<ProfileTemplateWithAuthor[]>([]);
  const [myTemplates, setMyTemplates] = useState<ProfileTemplateWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const loadPublic = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const items = await fetchPublicTemplates(sort, auth.user?.id);
    setPublicTemplates(items);
  }, [sort]);

  const loadMine = useCallback(async () => {
    const items = await fetchMyTemplates(profile.id);
    setMyTemplates(items);
  }, [profile.id]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadPublic(), loadMine()]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("dashboard.templates.toasts.loadError"));
    } finally {
      setLoading(false);
    }
  }, [loadPublic, loadMine]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleUse = async (template: ProfileTemplateWithAuthor) => {
    setApplyingId(template.id);
    try {
      const updated = await applyTemplateToProfile(template.id, profile);
      onProfileChange(updated);
      toast.success(t("dashboard.templates.toasts.applied"));
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("dashboard.templates.toasts.applyError"));
    } finally {
      setApplyingId(null);
    }
  };

  const handleUseInEditor = (template: ProfileTemplateWithAuthor) => {
    const updated = applyThemeToProfile(profile, template.theme);
    onProfileChange(updated);
    toast.success(t("dashboard.templates.toasts.appliedEditor"));
  };

  const handleFavorite = async (template: ProfileTemplateWithAuthor) => {
    try {
      await toggleTemplateFavorite(template.id, profile.id, !!template.is_favorited);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("dashboard.templates.toasts.favoriteError"));
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm(t("dashboard.templates.confirmDelete"))) return;
    try {
      await deleteTemplate(templateId);
      toast.success(t("dashboard.templates.toasts.deleted"));
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("dashboard.templates.toasts.deleteError"));
    }
  };

  const handleToggleVisibility = async (template: ProfileTemplateWithAuthor) => {
    if (template.is_live) {
      toast.error(t("dashboard.templates.toasts.liveControlled"));
      return;
    }
    const next = template.visibility === "public" ? "private" : "public";
    try {
      await updateTemplateMeta(template.id, { visibility: next });
      toast.success(
        next === "public"
          ? t("dashboard.templates.toasts.published")
          : t("dashboard.templates.toasts.madePrivate"),
      );
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("dashboard.templates.toasts.updateError"));
    }
  };

  const startEdit = (template: ProfileTemplateWithAuthor) => {
    setEditingId(template.id);
    setEditName(template.name);
  };

  const saveEdit = async (templateId: string) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error(t("dashboard.templates.toasts.invalidName"));
      return;
    }
    try {
      await updateTemplateMeta(templateId, { name: trimmed });
      setEditingId(null);
      toast.success(t("dashboard.templates.toasts.updated"));
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("dashboard.templates.toasts.saveError"));
    }
  };

  return (
    <DashboardAccountLayout profile={profile} activeSection="templates">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-white">
              <LayoutTemplate className="h-5 w-5 text-pink-400" />
              {t("dashboard.templates.title")}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-white/45">{t("dashboard.templates.description")}</p>
          </div>
          <Link
            to="/dashboard"
            search={{ view: "personalizar", panel: "aparencia" }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08]"
          >
            <Sparkles className="h-4 w-4 text-pink-400" />
            {t("dashboard.templates.openEditor")}
          </Link>
        </div>

        {profile.public_template_enabled && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
            <Globe className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <div>
              <p className="text-sm font-medium text-emerald-200">{t("dashboard.templates.publicActive")}</p>
              <p className="mt-0.5 text-xs text-emerald-200/70">
                {t("dashboard.templates.publicActiveDesc", {
                  name: profile.display_name || profile.username,
                })}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <TabButton active={tab === "explorar"} onClick={() => setTab("explorar")}>
            {t("dashboard.templates.tabs.public")}
          </TabButton>
          <TabButton active={tab === "meus"} onClick={() => setTab("meus")}>
            {t("dashboard.templates.tabs.mine", { count: myTemplates.length })}
          </TabButton>
        </div>

        {tab === "explorar" && (
          <>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTION_IDS.map((id) => {
                const Icon = id === "recent" ? Clock : id === "most_used" ? Heart : Star;
                const labelKey =
                  id === "recent"
                    ? "dashboard.templates.sort.recent"
                    : id === "most_used"
                      ? "dashboard.templates.sort.mostUsed"
                      : "dashboard.templates.sort.mostFavorited";
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSort(id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      sort === id
                        ? "border-pink-500/40 bg-pink-500/10 text-pink-200"
                        : "border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/[0.06]",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t(labelKey)}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <LoadingGrid />
            ) : publicTemplates.length === 0 ? (
              <EmptyState message={t("dashboard.templates.emptyPublic")} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {publicTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    using={applyingId === template.id}
                    onUse={() => handleUse(template)}
                    onToggleFavorite={() => handleFavorite(template)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "meus" && (
          <div className="space-y-4">
            {loading ? (
              <LoadingGrid />
            ) : myTemplates.length === 0 ? (
              <EmptyState message={t("dashboard.templates.emptyMine")} />
            ) : (
              myTemplates.map((template) => (
                <DashCard key={template.id} className="!p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {editingId === template.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => saveEdit(template.id)}
                            className="rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            {t("dashboard.common.save")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-xs text-white/45"
                          >
                            {t("dashboard.common.cancel")}
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-white">{template.name}</h3>
                            {template.is_live && (
                              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                                {t("dashboard.templates.live")}
                              </span>
                            )}
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                template.visibility === "public"
                                  ? "bg-sky-500/15 text-sky-300"
                                  : "bg-white/10 text-white/45",
                              )}
                            >
                              {template.visibility === "public"
                                ? t("dashboard.common.public")
                                : t("dashboard.common.private")}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-white/40">
                            <Heart className="mr-1 inline h-3 w-3 text-rose-400/80" />
                            {t("dashboard.templates.uses", { count: template.use_count })} ·{" "}
                            <Star className="mr-1 inline h-3 w-3 text-amber-400/80" />
                            {t("dashboard.templates.favorites", { count: template.favorite_count })}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUseInEditor(template)}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.05]"
                      >
                        {t("dashboard.templates.applyInEditor")}
                      </button>
                      {!template.is_live && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(template)}
                            className="rounded-lg border border-white/10 p-1.5 text-white/55 hover:bg-white/[0.05]"
                            title={t("dashboard.templates.rename")}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(template)}
                            className="rounded-lg border border-white/10 p-1.5 text-white/55 hover:bg-white/[0.05]"
                            title={
                              template.visibility === "public"
                                ? t("dashboard.templates.makePrivate")
                                : t("dashboard.templates.publish")
                            }
                          >
                            {template.visibility === "public" ? (
                              <Lock className="h-3.5 w-3.5" />
                            ) : (
                              <Globe className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(template.id)}
                            className="rounded-lg border border-red-500/20 p-1.5 text-red-400/80 hover:bg-red-500/10"
                            title={t("dashboard.common.delete")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </DashCard>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardAccountLayout>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-pink-500/40 bg-pink-500/10 text-white"
          : "border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/[0.06]",
      )}
    >
      {children}
    </button>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-52 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
      <LayoutTemplate className="mx-auto mb-3 h-8 w-8 text-white/20" />
      <p className="text-sm text-white/45">{message}</p>
    </div>
  );
}
