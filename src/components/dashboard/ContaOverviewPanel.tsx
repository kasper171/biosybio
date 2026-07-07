import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Circle,
  Copy,
  Crown,
  Eye,
  ImageIcon,
  Link2,
  Palette,
  Share2,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/lib/profile-storage";
import { profileHasFullAccess } from "@/lib/profile-roles";
import {
  getProfileCompletionPercent,
  getProfileCompletionTasks,
} from "@/lib/profile-completion";
import { fetchViewsLast7Days, type DailyViewStat } from "@/lib/profile-stats";
import { DashboardAccountLayout } from "./DashboardAccountLayout";

type Props = {
  profile: Profile;
};

type PersonalizePanel = "midia" | "perfil" | "conexoes" | "redes";

function formatViews(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return count.toLocaleString("pt-BR");
}

export function ContaOverviewPanel({ profile }: Props) {
  const [dailyViews, setDailyViews] = useState<DailyViewStat[]>([]);
  const [viewsLast7, setViewsLast7] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const tasks = getProfileCompletionTasks(profile);
  const completion = getProfileCompletionPercent(profile);
  const displayName = profile.display_name || profile.username;
  const hasDiscord = Boolean(profile.discord_user_id);
  const isPremiumPlan = profileHasFullAccess(profile);
  const pendingTasks = tasks.filter((t) => !t.done);

  useEffect(() => {
    let active = true;
    setLoadingStats(true);
    void fetchViewsLast7Days(profile.id).then((result) => {
      if (!active) return;
      setDailyViews(result.daily);
      setViewsLast7(result.totalLast7);
      setLoadingStats(false);
    });
    return () => {
      active = false;
    };
  }, [profile.id, profile.view_count]);

  const taskPanelMap: Record<string, PersonalizePanel> = {
    avatar: "midia",
    bio: "perfil",
    discord: "conexoes",
    social: "redes",
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/${profile.username}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const shortcuts = [
    {
      label: "Estúdio",
      desc: "Editar card",
      icon: Palette,
      search: { view: "personalizar" as const, panel: "aparencia" as const },
      accent: "from-violet-500/20 to-fuchsia-500/10",
    },
    {
      label: "Mídia",
      desc: "Fotos e banner",
      icon: ImageIcon,
      search: { view: "personalizar" as const, panel: "midia" as const },
      accent: "from-sky-500/20 to-blue-500/10",
    },
    {
      label: "Perfil",
      desc: "Nome e bio",
      icon: User,
      search: { view: "personalizar" as const, panel: "perfil" as const },
      accent: "from-emerald-500/20 to-teal-500/10",
    },
    {
      label: "Métricas",
      desc: "Ver tudo",
      icon: Eye,
      search: { section: "estatisticas" as const },
      accent: "from-pink-500/20 to-rose-500/10",
    },
  ];

  return (
    <DashboardAccountLayout profile={profile} activeSection="overview">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero */}
        <section className="biosy-dash-hero relative overflow-hidden rounded-3xl border border-white/[0.08] p-6 lg:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-pink-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/15 bg-white/5 shadow-lg shadow-black/30">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center">
                    <User className="dash-icon-md text-white/25" />
                  </div>
                )}
                {completion === 100 && (
                  <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-[#12121a] bg-emerald-500 text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="dash-t-caption font-medium uppercase tracking-widest text-pink-300/80">
                    Seu espaço Biosy
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 dash-t-caption font-semibold ${
                      isPremiumPlan
                        ? "border-amber-400/35 bg-amber-500/15 text-amber-200"
                        : "border-white/15 bg-white/[0.06] text-white/55"
                    }`}
                  >
                    {isPremiumPlan && <Crown className="h-3 w-3 shrink-0" aria-hidden />}
                    {isPremiumPlan ? "Plano Premium" : "Plano: Free"}
                  </span>
                </div>
                <h1 className="mt-1 dash-t-heading font-bold tracking-tight text-white">
                  {displayName}
                </h1>
                <p className="mt-1 dash-t-body text-white/50">
                  <span className="text-white/70">@{profile.username}</span>
                  {profile.public_uid != null && (
                    <span className="text-white/35"> · membro {profile.public_uid}</span>
                  )}
                </p>
                <p className="mt-2 dash-t-caption text-white/40">
                  <span className="font-semibold text-white/80">
                    {formatViews(profile.view_count ?? 0)}
                  </span>{" "}
                  visitas no total
                  {viewsLast7 > 0 && (
                    <span className="text-emerald-400/90">
                      {" "}
                      · +{formatViews(viewsLast7)} nos últimos 7 dias
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                to="/$username"
                params={{ username: profile.username }}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 dash-t-body font-semibold text-[#0b0b0f] transition hover:bg-white/90"
              >
                Ver ao vivo
                <ArrowUpRight className="dash-icon-sm" />
              </Link>
              <Link
                to="/dashboard"
                search={{ view: "personalizar", panel: "perfil" }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 dash-t-body font-medium text-white transition hover:bg-white/10"
              >
                Abrir editor
              </Link>
              <button
                type="button"
                onClick={() => void copyLink()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 dash-t-body text-white/60 transition hover:border-white/20 hover:text-white"
              >
                <Copy className="dash-icon-sm" />
                Copiar link
              </button>
            </div>
          </div>
        </section>

        {/* Bento grid */}
        <div className="grid gap-4 lg:grid-cols-12 lg:grid-rows-[auto_auto]">
          {/* Chart — wide */}
          <section className="biosy-dash-panel lg:col-span-8 lg:row-span-2">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="dash-t-title font-semibold text-white">Tráfego da semana</h2>
                <p className="mt-1 dash-t-caption text-white/40">
                  Visitas únicas por dia no seu perfil público
                </p>
              </div>
              <Link
                to="/dashboard"
                search={{ section: "estatisticas" }}
                className="dash-t-caption font-medium text-pink-400 transition hover:text-pink-300"
              >
                Relatório completo →
              </Link>
            </div>

            {loadingStats ? (
              <ChartSkeleton />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyViews} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
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
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      contentStyle={{
                        background: "#16161f",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        fontSize: 14,
                      }}
                      formatter={(value) => [`${value} visitas`, "Dia"]}
                    />
                    <Bar
                      dataKey="views"
                      fill="url(#biosyBarFill)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={44}
                    />
                    <defs>
                      <linearGradient id="biosyBarFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.72 0.26 0)" />
                        <stop offset="100%" stopColor="oklch(0.55 0.22 350)" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* Completion ring + checklist */}
          <section className="biosy-dash-panel flex flex-col lg:col-span-4">
            <h2 className="dash-t-title font-semibold text-white">Montagem do perfil</h2>
            <p className="mt-1 dash-t-caption text-white/40">
              {completion === 100
                ? "Tudo pronto — seu card está completo."
                : `${pendingTasks.length} detalhe${pendingTasks.length === 1 ? "" : "s"} pendente${pendingTasks.length === 1 ? "" : "s"}`}
            </p>

            <div className="my-6 flex items-center gap-5">
              <CompletionRing percent={completion} />
              <div className="min-w-0 flex-1 space-y-2.5">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2.5">
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                        task.done
                          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                          : "border-white/15 bg-white/[0.03] text-white/25"
                      }`}
                    >
                      {task.done ? (
                        <Sparkles className="h-3 w-3" />
                      ) : (
                        <Circle className="h-2 w-2 fill-current" />
                      )}
                    </span>
                    {task.done ? (
                      <span className="dash-t-caption text-white/35 line-through">{task.label}</span>
                    ) : (
                      <Link
                        to="/dashboard"
                        search={{ view: "personalizar", panel: taskPanelMap[task.id] }}
                        className="dash-t-caption font-medium text-white/75 transition hover:text-pink-300"
                      >
                        {task.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Integrations — compact */}
          <section className="biosy-dash-panel lg:col-span-4">
            <h2 className="mb-4 dash-t-title font-semibold text-white">Vínculos</h2>
            <div className="space-y-2.5">
              <Link
                to="/dashboard"
                search={{ view: "personalizar", panel: "conexoes" }}
                className="biosy-dash-tile flex items-center gap-3"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#5865F2]/25">
                  <svg className="h-5 w-5 text-[#8b9cff]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="dash-t-body font-medium text-white">Discord</p>
                  <p className="dash-t-caption text-white/40">
                    {hasDiscord ? "Conectado ao card" : "Mostrar status no perfil"}
                  </p>
                </div>
                <ArrowUpRight className="dash-icon-sm shrink-0 text-white/25" />
              </Link>

              <Link
                to="/dashboard"
                search={{ view: "personalizar", panel: "redes" }}
                className="biosy-dash-tile flex items-center gap-3"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.07]">
                  <Link2 className="dash-icon-md text-white/55" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="dash-t-body font-medium text-white">Links externos</p>
                  <p className="dash-t-caption text-white/40">Redes e portfólios</p>
                </div>
                <ArrowUpRight className="dash-icon-sm shrink-0 text-white/25" />
              </Link>

              <button
                type="button"
                onClick={() => void copyLink()}
                className="biosy-dash-tile flex w-full items-center gap-3 text-left"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pink-500/15">
                  <Share2 className="dash-icon-md text-pink-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="dash-t-body font-medium text-white">Divulgar</p>
                  <p className="dash-t-caption text-white/40">Copiar URL pública</p>
                </div>
              </button>
            </div>
          </section>
        </div>

        {/* Shortcuts row */}
        <section>
          <h2 className="mb-4 dash-t-title font-semibold text-white">Atalhos rápidos</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {shortcuts.map((item) => (
              <Link
                key={item.label}
                to="/dashboard"
                search={item.search}
                className={`group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br ${item.accent} p-4 transition hover:border-white/15`}
              >
                <item.icon className="dash-icon-md text-white/70" />
                <p className="mt-3 dash-t-body font-semibold text-white">{item.label}</p>
                <p className="dash-t-caption text-white/45">{item.desc}</p>
                <ArrowUpRight className="absolute right-4 top-4 dash-icon-sm text-white/20 transition group-hover:text-white/50" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </DashboardAccountLayout>
  );
}

function CompletionRing({ percent }: { percent: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div className="relative grid h-[88px] w-[88px] shrink-0 place-items-center">
      <svg className="-rotate-90" width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="url(#biosyRingGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700"
        />
        <defs>
          <linearGradient id="biosyRingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.26 0)" />
            <stop offset="100%" stopColor="oklch(0.58 0.24 350)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute dash-t-body font-bold text-white">{percent}%</span>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-2 w-40 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-gradient-to-r from-pink-500/40 to-violet-500/40" />
      </div>
    </div>
  );
}
