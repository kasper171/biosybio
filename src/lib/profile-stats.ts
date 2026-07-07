import { supabase } from "@/integrations/supabase/client";

export type DailyViewStat = {
  date: string;
  label: string;
  views: number;
};

export type ProfileStatsBundle = {
  daily7: DailyViewStat[];
  daily30: DailyViewStat[];
  totalLast7: number;
  totalLast30: number;
  peakDay7: DailyViewStat | null;
  avgPerDay7: number;
  error?: string;
};

function formatDayLabel(date: Date, short = true): string {
  if (short) {
    return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" });
  }
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildLastNDaysBuckets(days: number, shortLabels = true): DailyViewStat[] {
  const buckets: DailyViewStat[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    buckets.push({
      date: toDateKey(d),
      label: formatDayLabel(d, shortLabels),
      views: 0,
    });
  }
  return buckets;
}

export function buildLast7DaysBuckets(): DailyViewStat[] {
  return buildLastNDaysBuckets(7);
}

function aggregateViewsIntoBuckets(
  buckets: DailyViewStat[],
  rows: { viewed_at: string }[],
): DailyViewStat[] {
  const map = new Map(buckets.map((b) => [b.date, { ...b }]));
  for (const row of rows) {
    const key = toDateKey(new Date(row.viewed_at));
    const bucket = map.get(key);
    if (bucket) bucket.views += 1;
  }
  return buckets.map((b) => map.get(b.date) ?? b);
}

async function fetchViewEventsSince(profileId: string, since: Date) {
  return supabase
    .from("profile_view_events")
    .select("viewed_at")
    .eq("profile_id", profileId)
    .gte("viewed_at", since.toISOString());
}

export async function fetchViewsLast7Days(profileId: string): Promise<{
  daily: DailyViewStat[];
  totalLast7: number;
  error?: string;
}> {
  const buckets = buildLast7DaysBuckets();
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const { data, error } = await fetchViewEventsSince(profileId, since);

  if (error) {
    return { daily: buckets, totalLast7: 0, error: error.message };
  }

  const daily = aggregateViewsIntoBuckets(buckets, data ?? []);
  const totalLast7 = daily.reduce((sum, b) => sum + b.views, 0);
  return { daily, totalLast7 };
}

export async function fetchProfileStatsBundle(profileId: string): Promise<ProfileStatsBundle> {
  const daily7 = buildLastNDaysBuckets(7);
  const daily30 = buildLastNDaysBuckets(30, false);

  const since30 = new Date();
  since30.setDate(since30.getDate() - 29);
  since30.setHours(0, 0, 0, 0);

  const { data, error } = await fetchViewEventsSince(profileId, since30);

  if (error) {
    return {
      daily7,
      daily30,
      totalLast7: 0,
      totalLast30: 0,
      peakDay7: null,
      avgPerDay7: 0,
      error: error.message,
    };
  }

  const filled7 = aggregateViewsIntoBuckets(daily7, data ?? []);
  const filled30 = aggregateViewsIntoBuckets(daily30, data ?? []);
  const totalLast7 = filled7.reduce((sum, b) => sum + b.views, 0);
  const totalLast30 = filled30.reduce((sum, b) => sum + b.views, 0);
  const peakDay7 =
    filled7.length > 0
      ? filled7.reduce((best, day) => (day.views > best.views ? day : best), filled7[0])
      : null;

  return {
    daily7: filled7,
    daily30: filled30,
    totalLast7,
    totalLast30,
    peakDay7: peakDay7 && peakDay7.views > 0 ? peakDay7 : null,
    avgPerDay7: Math.round((totalLast7 / 7) * 10) / 10,
  };
}
