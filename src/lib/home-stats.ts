import { supabase } from "@/integrations/supabase/client";

/** Base exibida na home — somada às visualizações reais de todos os perfis */
export const PLATFORM_VIEWS_BASE = 7_234;
/** Base exibida na home — somada aos cliques reais em links sociais */
export const PLATFORM_CLICKS_BASE = 9_213;

export type PlatformStats = {
  profileCount: number;
  totalViews: number;
  totalClicks: number;
};

export type FeaturedCreator = {
  username: string;
  display_name: string;
  avatar_url: string;
  view_count: number;
};

export function formatPlatformMetric(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatCreatorViews(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return formatPlatformMetric(count);
}

export type CreatorAvatar = {
  avatar_url: string;
  username: string;
  display_name: string;
};

export async function fetchCreatorAvatars(limit = 5): Promise<CreatorAvatar[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url")
    .not("avatar_url", "is", null)
    .neq("avatar_url", "")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[fetchCreatorAvatars]", error.message);
    return [];
  }

  return (data ?? []) as CreatorAvatar[];
}

export function formatHeroCreatorLabel(count: number): string {
  if (count <= 0) return "Seja o primeiro criador no Biosy";
  if (count >= 300) return `${count}+ criadores já usam o Biosy`;
  if (count === 1) return "1 criador já usa o Biosy";
  return `${count} criadores já usam o Biosy`;
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const { data, error } = await supabase.rpc("get_platform_stats");

  if (!error && data) {
    const row = data as Record<string, unknown>;
    const profileCount = Number(row.profile_count ?? 0);
    const realViews = Number(row.total_views ?? 0);
    const realClicks = Number(row.total_clicks ?? 0);

    return {
      profileCount,
      totalViews: PLATFORM_VIEWS_BASE + realViews,
      totalClicks: PLATFORM_CLICKS_BASE + realClicks,
    };
  }

  if (error) {
    console.error("[fetchPlatformStats]", error.message);
  }

  const [{ count }, { data: sums }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("view_count, link_click_count"),
  ]);

  const rows = sums ?? [];
  const realViews = rows.reduce((acc, row) => acc + Number(row.view_count ?? 0), 0);
  const realClicks = rows.reduce((acc, row) => acc + Number((row as { link_click_count?: number }).link_click_count ?? 0), 0);

  return {
    profileCount: count ?? 0,
    totalViews: PLATFORM_VIEWS_BASE + realViews,
    totalClicks: PLATFORM_CLICKS_BASE + realClicks,
  };
}

export async function fetchFeaturedCreators(limit = 24): Promise<FeaturedCreator[]> {
  const { data, error } = await supabase.rpc("get_featured_creators", { limit_count: limit });

  if (error) {
    console.error("[fetchFeaturedCreators]", error.message);
    const { data: fallback } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url, view_count")
      .not("avatar_url", "is", null)
      .neq("avatar_url", "")
      .order("view_count", { ascending: false })
      .limit(limit);

    return (fallback ?? []) as FeaturedCreator[];
  }

  return (data ?? []) as FeaturedCreator[];
}
