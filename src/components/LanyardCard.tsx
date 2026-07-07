import { useEffect, useState } from "react";

type Badge = {
  id: string;
  description: string;
  icon: string;
  link?: string;
};

type ProfileData = {
  user: {
    id: string;
    username: string;
    global_name?: string | null;
    avatar?: string | null;
  };
  badges: Badge[];
};

export function LanyardCard({ userId, role }: { userId: string; role: string }) {
  const [data, setData] = useState<ProfileData | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`https://dcdn.dstn.to/profile/${userId}`)
      .then((r) => r.json())
      .then((json) => {
        if (active) setData(json);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [userId]);

  const name = data?.user?.global_name || data?.user?.username || "Loading...";
  const avatarUrl = data?.user?.avatar
    ? `https://cdn.discordapp.com/avatars/${userId}/${data.user.avatar}.png?size=256`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;
  const badges = data?.badges ?? [];

  return (
    <div className="rotating-border relative rounded-2xl p-[2px]">
      <div className="card-surface relative h-full rounded-2xl p-5 text-center">
        <div className="relative mx-auto h-20 w-20">
          <div
            className="absolute -inset-1 rounded-full opacity-70 blur-md"
            style={{ background: "oklch(0.65 0.28 0)" }}
          />
          <img
            src={avatarUrl}
            alt={name}
            className="relative h-20 w-20 rounded-full object-cover ring-2"
            style={{ ['--tw-ring-color' as any]: "oklch(0.65 0.28 0)" }}
          />
        </div>
        <h3 className="mt-3 font-bold">{name}</h3>
        <p className="text-xs text-white/55">{role}</p>

        <div className="mt-4 flex min-h-[28px] flex-wrap items-center justify-center gap-1.5">
          {badges.length === 0 ? (
            <span className="text-[10px] text-white/30">Sem badges</span>
          ) : (
            badges.map((b) => (
              <div
                key={b.id}
                title={b.description}
                className="grid h-7 w-7 place-items-center rounded-md border border-pink-hot/30 bg-pink-hot/5"
              >
                <img
                  src={`https://cdn.discordapp.com/badge-icons/${b.icon}.png`}
                  alt={b.description}
                  className="h-5 w-5"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
