import { useEffect, useState } from "react";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import {
  fetchPlatformStats,
  formatPlatformMetric,
  type PlatformStats,
} from "@/lib/home-stats";

function smoothSparklinePaths(seed: number, width = 200, height = 60) {
  const values = Array.from({ length: 12 }, (_, j) => {
    const t = j / 11;
    const trend = 0.32 + t * 0.48;
    const wave = Math.sin(t * Math.PI * 1.15 + seed * 1.7) * 0.05;
    return trend + wave;
  });

  const padY = 8;
  const innerH = height - padY * 2;
  const step = width / (values.length - 1);

  const pts = values.map((v, j) => ({
    x: j * step,
    y: padY + innerH * (1 - v),
  }));

  let line = `M${pts[0].x},${pts[0].y}`;
  for (let j = 0; j < pts.length - 1; j++) {
    const p0 = pts[Math.max(0, j - 1)];
    const p1 = pts[j];
    const p2 = pts[j + 1];
    const p3 = pts[Math.min(pts.length - 1, j + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    line += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  return { line, area: `${line} L${width},${height} L0,${height} Z` };
}

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
        { t: "Profiles created", v: formatPlatformMetric(stats.profileCount) },
        { t: "Views", v: formatPlatformMetric(stats.totalViews) },
        { t: "Clicks", v: formatPlatformMetric(stats.totalClicks) },
      ]
    : null;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-20">
      <div className="card-surface rounded-3xl p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_2.5fr]">
          <div>
            <HomeScrollReveal variant="up">
              <h2 className="text-3xl font-black">Grow. Connect. Inspire.</h2>
            </HomeScrollReveal>
            <HomeScrollReveal variant="up" delay={80}>
              <p className="mt-4 text-sm text-white/60">
                Thousands of creators are already transforming their profiles and reaching the world.
              </p>
            </HomeScrollReveal>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {items
              ? items.map((s, i) => {
                  const { line, area } = smoothSparklinePaths(i + 1);
                  return (
                    <div key={s.t}>
                      <div className="text-xs text-white/60">{s.t}</div>
                      <div className="mt-1 text-3xl font-black tabular-nums">{s.v}</div>
                      <svg viewBox="0 0 200 60" className="mt-3 h-16 w-full" aria-hidden>
                        <defs>
                          <linearGradient id={`g${i}`} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="oklch(0.65 0.28 0)" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="oklch(0.65 0.28 0)" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={area} fill={`url(#g${i})`} />
                        <path
                          d={line}
                          stroke="oklch(0.65 0.28 0)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </div>
                  );
                })
              : [0, 1, 2].map((i) => <StatSkeleton key={i} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
