import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import {
  fetchCreatorAvatars,
  fetchPlatformStats,
  formatHeroCreatorLabel,
  type CreatorAvatar,
} from "@/lib/home-stats";

export function HomeSocialProof() {
  const [avatars, setAvatars] = useState<CreatorAvatar[]>([]);
  const [creatorLabel, setCreatorLabel] = useState("Criadores já usam o Biosy");

  useEffect(() => {
    let cancelled = false;

    void Promise.all([fetchCreatorAvatars(5), fetchPlatformStats()]).then(([rows, stats]) => {
      if (cancelled) return;
      setAvatars(rows);
      setCreatorLabel(formatHeroCreatorLabel(stats.profileCount));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mt-8 flex items-center gap-4">
      <div className="flex -space-x-2">
        {avatars.length > 0 ? (
          avatars.map((creator) => (
            <img
              key={creator.username}
              src={creator.avatar_url}
              alt={creator.display_name || creator.username}
              title={creator.display_name || creator.username}
              className="h-9 w-9 rounded-full border-2 border-background object-cover"
            />
          ))
        ) : (
          [0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 w-9 animate-pulse rounded-full border-2 border-background bg-white/10"
            />
          ))
        )}
      </div>
      <div>
        <div className="flex text-pink-hot">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-current" />
          ))}
        </div>
        <p className="mt-1 text-xs text-white/70">
          <span className="font-semibold text-white">{creatorLabel}</span>
        </p>
      </div>
    </div>
  );
}
