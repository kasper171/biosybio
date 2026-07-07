import { useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import {
  fetchDiscordUserProfile,
  getDiscordAvatarUrl,
  type DiscordUserProfile,
} from "@/lib/discord-user";

type Props = {
  userId: string;
  onDisconnect: () => void;
};

export function DiscordConnectedCard({ userId, onDisconnect }: Props) {
  const [user, setUser] = useState<DiscordUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void fetchDiscordUserProfile(userId).then((profile) => {
      if (!active) return;
      setUser(profile);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  const displayName = user?.global_name || user?.username || "Discord";
  const username = user?.username ?? "discord";
  const avatarUrl = user ? getDiscordAvatarUrl(user) : getDiscordAvatarUrl({ id: userId, username: "discord", global_name: null, avatar: null });

  return (
    <div className="overflow-hidden rounded-xl border border-[#5865F2]/30 bg-gradient-to-br from-[#5865F2]/12 via-[var(--biosy-bg-base)] to-[var(--biosy-bg-base)]">
      <div className="flex items-start gap-3 p-3.5">
        <div className="relative shrink-0">
          <div className="absolute -inset-0.5 rounded-full bg-[#5865F2]/40 blur-sm" aria-hidden />
          <img
            src={avatarUrl}
            alt=""
            className="relative h-14 w-14 rounded-full border-2 border-[#5865F2]/50 object-cover"
          />
          <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full border border-[#0e0e13] bg-[#5865F2]">
            <FaDiscord className="h-2.5 w-2.5 text-white" aria-hidden />
          </span>
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
              Connected
            </span>
            {loading && <Loader2 className="h-3 w-3 animate-spin text-white/40" />}
          </div>
          <p className="truncate text-base font-semibold text-white">{displayName}</p>
          <p className="truncate text-sm text-white/55">@{username}</p>
          <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-black/30 px-2 py-1 font-mono text-[11px] text-white/45">
            ID {userId}
          </p>
        </div>
      </div>

      <div className="flex border-t border-white/[0.06]">
        <a
          href={`https://discord.com/users/${userId}`}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 border-r border-white/[0.06] px-3 py-2.5 text-xs font-medium text-white/70 transition hover:bg-white/[0.04] hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View profile
        </a>
        <button
          type="button"
          onClick={onDisconnect}
          className="flex-1 px-3 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
