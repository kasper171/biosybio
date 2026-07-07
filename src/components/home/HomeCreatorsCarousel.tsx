import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import {
  fetchFeaturedCreators,
  formatCreatorViews,
  type FeaturedCreator,
} from "@/lib/home-stats";

function CreatorCard({ creator }: { creator: FeaturedCreator }) {
  const name = creator.display_name?.trim() || creator.username;

  return (
    <Link
      to="/$username"
      params={{ username: creator.username }}
      className="card-surface block w-40 shrink-0 rounded-2xl p-4 text-center transition hover:border-pink-hot/30"
    >
      <div className="relative mx-auto h-20 w-20">
        <div
          className="absolute -inset-1 rounded-full opacity-70 blur-md"
          style={{ background: "oklch(0.65 0.28 0 / 0.55)" }}
        />
        <img
          src={creator.avatar_url}
          alt={name}
          className="relative h-20 w-20 rounded-full object-cover ring-2 ring-pink-hot/40"
        />
      </div>
      <h3 className="mt-3 truncate font-bold">{name}</h3>
      <p className="truncate text-xs text-white/55">@{creator.username}</p>
      <div className="mt-3 flex items-center justify-center gap-1.5 text-pink-hot">
        <Eye className="h-3.5 w-3.5" />
        <span className="text-lg font-black tabular-nums">
          {formatCreatorViews(creator.view_count ?? 0)}
        </span>
      </div>
      <p className="text-[10px] text-white/50">visualizações</p>
    </Link>
  );
}

function expandCreatorsForMarquee(creators: FeaturedCreator[], minItems = 6): FeaturedCreator[] {
  if (creators.length === 0) return [];
  if (creators.length >= minItems) return creators;
  const repeats = Math.ceil(minItems / creators.length);
  return Array.from({ length: repeats }, () => creators).flat();
}

export function HomeCreatorsCarousel() {
  const [creators, setCreators] = useState<FeaturedCreator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchFeaturedCreators(24).then((rows) => {
      if (!cancelled) {
        setCreators(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const marqueeTrack = useMemo(() => {
    const base = expandCreatorsForMarquee(creators);
    return [...base, ...base];
  }, [creators]);

  const marqueeDuration = Math.max(marqueeTrack.length * 3.5, 24);

  return (
    <section className="mx-auto max-w-7xl px-6 pb-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_2.5fr]">
        <div>
          <HomeScrollReveal variant="up">
            <h2 className="text-4xl font-black leading-tight">
              Criadores que
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, oklch(0.7 0.28 0), oklch(0.6 0.27 10))",
                }}
              >
                estão inspirando
              </span>
            </h2>
          </HomeScrollReveal>
          <HomeScrollReveal variant="up" delay={80}>
            <p className="mt-4 text-sm text-white/60">
              Perfis reais da comunidade Biosy.
              <br />
              Conecte-se e siga seus favoritos.
            </p>
          </HomeScrollReveal>
        </div>

        <div className="relative min-w-0 overflow-hidden">
          {loading ? (
            <div className="flex gap-4 overflow-hidden">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="card-surface h-52 w-40 shrink-0 animate-pulse rounded-2xl bg-white/[0.03]"
                />
              ))}
            </div>
          ) : creators.length === 0 ? (
            <div className="card-surface rounded-2xl px-6 py-10 text-center text-sm text-white/55">
              Em breve criadores com avatar aparecerão aqui.
            </div>
          ) : (
            <div
              className="home-creators-marquee-track flex gap-4"
              style={{ ["--marquee-duration" as string]: `${marqueeDuration}s` }}
            >
              {marqueeTrack.map((creator, index) => (
                <CreatorCard key={`${creator.username}-${index}`} creator={creator} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
