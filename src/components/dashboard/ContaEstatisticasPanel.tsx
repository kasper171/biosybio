import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, Calendar, Eye, MessageSquare, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/profile-storage";
import { fetchProfileStatsBundle, type ProfileStatsBundle } from "@/lib/profile-stats";
import { DashboardAccountLayout } from "./DashboardAccountLayout";

type Props = {
  profile: Profile;
};

function formatViews(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return count.toLocaleString("pt-BR");
}

const chartTooltipStyle = {
  background: "#16161f",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 14,
};

export function ContaEstatisticasPanel({ profile }: Props) {
  const [stats, setStats] = useState<ProfileStatsBundle | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    void Promise.all([
      fetchProfileStatsBundle(profile.id),
      supabase
        .from("profile_comments")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id),
    ]).then(([bundle, commentsRes]) => {
      if (!active) return;
      setStats(bundle);
      setCommentCount(commentsRes.count ?? 0);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [profile.id, profile.view_count]);

  const totalViews = profile.view_count ?? 0;
  const weekViews = stats?.totalLast7 ?? 0;
  const monthViews = stats?.totalLast30 ?? 0;

  const insights = [
    {
      icon: TrendingUp,
      label: "Semana",
      value: loading ? "—" : formatViews(weekViews),
      hint: stats?.peakDay7 ? `Pico ${stats.peakDay7.views} · ${stats.peakDay7.label}` : "Sem pico ainda",
    },
    {
      icon: Calendar,
      label: "Mês",
      value: loading ? "—" : formatViews(monthViews),
      hint: "Últimos 30 dias",
    },
    {
      icon: MessageSquare,
      label: "Comentários",
      value: loading ? "—" : String(commentCount),
      hint: "No seu card público",
    },
    {
      icon: Eye,
      label: "Média/dia",
      value: loading ? "—" : formatViews(stats?.avgPerDay7 ?? 0),
      hint: "Base 7 dias",
    },
  ];

  return (
    <DashboardAccountLayout profile={profile} activeSection="estatisticas">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              to="/dashboard"
              className="mb-3 inline-flex items-center gap-1.5 dash-t-caption text-white/40 transition hover:text-white"
            >
              <ArrowLeft className="dash-icon-sm" />
              Voltar ao painel
            </Link>
            <h1 className="dash-t-heading font-bold text-white">Métricas</h1>
            <p className="mt-1.5 dash-t-body text-white/45">
              Números de visita e engajamento do seu perfil público.
            </p>
          </div>
        </div>

        {/* Total highlight */}
        <section className="biosy-dash-hero relative overflow-hidden rounded-3xl border border-white/[0.08] px-6 py-8 lg:px-10">
          <div className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-pink-500/10 blur-3xl" />
          <p className="dash-t-caption font-medium uppercase tracking-widest text-white/40">
            Visitas acumuladas
          </p>
          <p className="mt-2 text-5xl font-bold tracking-tight text-white lg:text-6xl">
            {loading ? "—" : formatViews(totalViews)}
          </p>
          <p className="mt-2 dash-t-body text-white/45">
            @{profile.username} · desde que o perfil foi criado
          </p>
        </section>

        {/* Insight strip */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {insights.map((item) => (
            <div
              key={item.label}
              className="biosy-dash-panel flex items-start gap-3 !p-4"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.06]">
                <item.icon className="dash-icon-md text-white/50" />
              </div>
              <div>
                <p className="dash-t-caption text-white/40">{item.label}</p>
                <p className="dash-t-title font-bold text-white">{item.value}</p>
                <p className="mt-0.5 dash-t-micro text-white/35">{item.hint}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts — stacked, different types */}
        <section className="biosy-dash-panel">
          <h2 className="dash-t-title font-semibold text-white">Últimos 7 dias</h2>
          <p className="mt-1 dash-t-caption text-white/40">Curva de visitas diárias</p>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="mt-5 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.daily7 ?? []} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [`${value} visitas`, "Dia"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="oklch(0.68 0.27 0)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "oklch(0.68 0.27 0)", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="biosy-dash-panel">
          <h2 className="dash-t-title font-semibold text-white">Últimos 30 dias</h2>
          <p className="mt-1 dash-t-caption text-white/40">Volume por dia no mês</p>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="mt-5 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.daily30 ?? []} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [`${value} visitas`, "Dia"]}
                  />
                  <Bar dataKey="views" fill="oklch(0.55 0.22 350)" radius={[4, 4, 0, 0]} maxBarSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </DashboardAccountLayout>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-56 items-center justify-center">
      <div className="h-2 w-40 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-gradient-to-r from-pink-500/40 to-violet-500/40" />
      </div>
    </div>
  );
}
