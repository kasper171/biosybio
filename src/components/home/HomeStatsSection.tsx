import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import {
  fetchPlatformStats,
  formatPlatformMetric,
  type PlatformStats,
} from "@/lib/home-stats";

function StatSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-3 w-24 rounded bg-white/10" />
      <div className="h-9 w-32 rounded bg-white/10" />
      <div className="mt-3 h-16 w-full rounded bg-white/5" />
    </div>
  );
}

export function HomeStatsSection() {
  const [stats, setStats] = useState<PlatformStats | null>(null);

  const loadStats = () => {
    void fetchPlatformStats().then(setStats);
  };

  useEffect(() => {
    loadStats();

    const onVisible = () => {
      if (document.visibilityState === "visible") loadStats();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", loadStats);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") loadStats();
    }, 20_000);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", loadStats);
      clearInterval(interval);
    };
  }, []);

  const items = stats
    ? [
        { t: "Perfis criados", v: formatPlatformMetric(stats.profileCount) },
        { t: "Visualizações", v: formatPlatformMetric(stats.totalViews) },
        { t: "Cliques", v: formatPlatformMetric(stats.totalClicks) },
      ]
    : null;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-20">
      <div className="card-surface rounded-3xl p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_2.5fr]">
          <div>
            <HomeScrollReveal variant="up">
              <h2 className="text-3xl font-black">Cresça. Conecte. Inspire.</h2>
            </HomeScrollReveal>
            <HomeScrollReveal variant="up" delay={80}>
              <p className="mt-4 text-sm text-white/60">
                Milhares de criadores já estão transformando seus perfis e alcançando o mundo.
              </p>
            </HomeScrollReveal>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-pink-hot/30 bg-pink-hot/5 px-3 py-1 text-xs text-pink-hot">
              <Sparkles className="h-3 w-3" /> Atualizado em tempo real
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {items
              ? items.map((s, i) => (
                  <div key={s.t}>
                    <div className="text-xs text-white/60">{s.t}</div>
                    <div className="mt-1 text-3xl font-black tabular-nums">{s.v}</div>
                    <svg viewBox="0 0 200 60" className="mt-3 h-16 w-full">
                      <defs>
                        <linearGradient id={`g${i}`} x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.65 0.28 0)" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="oklch(0.65 0.28 0)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`M0,${40 + i * 2} L10,35 L20,42 L30,30 L40,38 L50,25 L60,32 L70,20 L80,28 L90,15 L100,22 L110,28 L120,18 L130,25 L140,12 L150,20 L160,10 L170,18 L180,8 L190,15 L200,5 L200,60 L0,60 Z`}
                        fill={`url(#g${i})`}
                      />
                      <path
                        d={`M0,${40 + i * 2} L10,35 L20,42 L30,30 L40,38 L50,25 L60,32 L70,20 L80,28 L90,15 L100,22 L110,28 L120,18 L130,25 L140,12 L150,20 L160,10 L170,18 L180,8 L190,15 L200,5`}
                        stroke="oklch(0.65 0.28 0)"
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </svg>
                  </div>
                ))
              : [0, 1, 2].map((i) => <StatSkeleton key={i} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
