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

type Tab = "explorar" | "meus";

type Props = {
  profile: Profile;
  onProfileChange: (profile: Profile) => void;
  initialTab?: Tab;
};

const SORT_OPTIONS: { id: TemplateSort; label: string; icon: typeof Clock }[] = [
  { id: "recent", label: "Recently updated", icon: Clock },
  { id: "most_used", label: "Most used", icon: Heart },
  { id: "most_favorited", label: "Most favorited", icon: Star },
];

export function DashboardTemplatesPage({ profile, onProfileChange, initialTab = "explorar" }: Props) {
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
      toast.error(e instanceof Error ? e.message : "Error loading templates");
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
      toast.success("Template applied! Your avatar, images, and music were kept.");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error applying template");
    } finally {
      setApplyingId(null);
    }
  };

  const handleUseInEditor = (template: ProfileTemplateWithAuthor) => {
    const updated = applyThemeToProfile(profile, template.theme);
    onProfileChange(updated);
    toast.success("Style applied in the editor. Click Save to keep it.");
  };

  const handleFavorite = async (template: ProfileTemplateWithAuthor) => {
    try {
      await toggleTemplateFavorite(template.id, profile.id, !!template.is_favorited);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error favoriting");
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm("Delete this template permanently?")) return;
    try {
      await deleteTemplate(templateId);
      toast.success("Template deleted");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error deleting");
    }
  };

  const handleToggleVisibility = async (template: ProfileTemplateWithAuthor) => {
    if (template.is_live) {
      toast.error("The live template is controlled by the Public Template option in Account.");
      return;
    }
    const next = template.visibility === "public" ? "private" : "public";
    try {
      await updateTemplateMeta(template.id, { visibility: next });
      toast.success(next === "public" ? "Template published!" : "Template made private");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error updating");
    }
  };

  const startEdit = (template: ProfileTemplateWithAuthor) => {
    setEditingId(template.id);
    setEditName(template.name);
  };

  const saveEdit = async (templateId: string) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error("Invalid name");
      return;
    }
    try {
      await updateTemplateMeta(templateId, { name: trimmed });
      setEditingId(null);
      toast.success("Template updated");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error saving");
    }
  };

  return (
    <DashboardAccountLayout profile={profile} activeSection="templates">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-white">
              <LayoutTemplate className="h-5 w-5 text-pink-400" />
              Templates
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-white/45">
              Explore community styles or manage your own. When you use a template, only layout,
              colors, sizes, and effects are copied — your avatar, images, and music stay yours.
            </p>
          </div>
          <Link
            to="/dashboard"
            search={{ view: "personalizar", panel: "aparencia" }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08]"
          >
            <Sparkles className="h-4 w-4 text-pink-400" />
            Open editor
          </Link>
        </div>

        {profile.public_template_enabled && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
            <Globe className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <div>
              <p className="text-sm font-medium text-emerald-200">Public template active</p>
              <p className="mt-0.5 text-xs text-emerald-200/70">
                Your current style is published as{" "}
                <span className="font-semibold">{profile.display_name || profile.username}&apos;s Template</span>{" "}
                and updates automatically when you save your profile.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <TabButton active={tab === "explorar"} onClick={() => setTab("explorar")}>
            Public templates
          </TabButton>
          <TabButton active={tab === "meus"} onClick={() => setTab("meus")}>
            My templates ({myTemplates.length})
          </TabButton>
        </div>

        {tab === "explorar" && (
          <>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSort(opt.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      sort === opt.id
                        ? "border-pink-500/40 bg-pink-500/10 text-pink-200"
                        : "border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/[0.06]",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <LoadingGrid />
            ) : publicTemplates.length === 0 ? (
              <EmptyState message="No public templates yet. Be the first to publish!" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {publicTemplates.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    using={applyingId === t.id}
                    onUse={() => handleUse(t)}
                    onToggleFavorite={() => handleFavorite(t)}
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
              <EmptyState message="You haven't saved any templates yet. Use Save template in the editor to create one." />
            ) : (
              myTemplates.map((t) => (
                <DashCard key={t.id} className="!p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {editingId === t.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => saveEdit(t.id)}
                            className="rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-xs text-white/45"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-white">{t.name}</h3>
                            {t.is_live && (
                              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                                Live
                              </span>
                            )}
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                t.visibility === "public"
                                  ? "bg-sky-500/15 text-sky-300"
                                  : "bg-white/10 text-white/45",
                              )}
                            >
                              {t.visibility === "public" ? "Public" : "Private"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-white/40">
                            <Heart className="mr-1 inline h-3 w-3 text-rose-400/80" />
                            {t.use_count} uses ·{" "}
                            <Star className="mr-1 inline h-3 w-3 text-amber-400/80" />
                            {t.favorite_count} favorites
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUseInEditor(t)}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.05]"
                      >
                        Apply in editor
                      </button>
                      {!t.is_live && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(t)}
                            className="rounded-lg border border-white/10 p-1.5 text-white/55 hover:bg-white/[0.05]"
                            title="Rename"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(t)}
                            className="rounded-lg border border-white/10 p-1.5 text-white/55 hover:bg-white/[0.05]"
                            title={t.visibility === "public" ? "Make private" : "Publish"}
                          >
                            {t.visibility === "public" ? (
                              <Lock className="h-3.5 w-3.5" />
                            ) : (
                              <Globe className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(t.id)}
                            className="rounded-lg border border-red-500/20 p-1.5 text-red-400/80 hover:bg-red-500/10"
                            title="Delete"
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
