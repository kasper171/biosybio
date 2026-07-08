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
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCreatorViews(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return formatPlatformMetric(count);
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

  return {
    profileCount: 0,
    totalViews: PLATFORM_VIEWS_BASE,
    totalClicks: PLATFORM_CLICKS_BASE,
  };
}

export async function fetchFeaturedCreators(limit = 24): Promise<FeaturedCreator[]> {
  const { data, error } = await supabase.rpc("get_featured_creators", { limit_count: limit });

  if (error) {
    console.error("[fetchFeaturedCreators]", error.message);
    const { data: fallback } = await supabase
      .from("profiles_public")
      .select("username, display_name, avatar_url, view_count")
      .not("avatar_url", "is", null)
      .neq("avatar_url", "")
      .order("view_count", { ascending: false })
      .limit(limit);

    return (fallback ?? []) as FeaturedCreator[];
  }

  return (data ?? []) as FeaturedCreator[];
}
