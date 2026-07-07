import { useMemo, useState } from "react";
import { Crown, Lock, Search, X } from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/lib/profile-storage";
import {
  AVATAR_FRAMES,
  FREE_AVATAR_FRAME_COUNT,
  canUseAvatarFrame,
  isAvatarFrameLocked,
} from "@/lib/avatar-frames";
import { profileHasFullAccess } from "@/lib/profile-roles";
import { AvatarWithFrame } from "@/components/AvatarWithFrame";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Props = {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
};

const PAGE_SIZE = 48;

export function MoldurasPanel({ profile, update }: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const hasFullAccess = profileHasFullAccess(profile);
  const avatarSize = profile.avatar_size ?? 96;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return AVATAR_FRAMES;
    return AVATAR_FRAMES.filter((f) => f.name.toLowerCase().includes(q));
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const selectFrame = (frameId: string | null) => {
    if (frameId && !canUseAvatarFrame(frameId, profile)) {
      toast.error("Moldura premium — faça upgrade para desbloquear.");
      return;
    }
    update("avatar_frame_id", frameId);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Preview</p>
        <div className="mt-3 flex justify-center py-2">
          <AvatarWithFrame size={Math.min(avatarSize, 120)} frameId={profile.avatar_frame_id}>
            <Avatar
              className="overflow-hidden rounded-full ring-offset-0"
              style={{
                width: Math.min(avatarSize, 120),
                height: Math.min(avatarSize, 120),
                boxShadow:
                  (profile.avatar_border_width ?? 4) > 0
                    ? `0 0 0 ${profile.avatar_border_width}px ${profile.avatar_border_color ?? profile.card_border_color}`
                    : undefined,
              }}
            >
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt="" className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-white/10 text-white/40">?</AvatarFallback>
            </Avatar>
          </AvatarWithFrame>
        </div>
        <p className="mt-2 text-center text-[11px] text-white/40">
          {profile.avatar_frame_id ? profile.avatar_frame_id : "Nenhuma moldura selecionada"}
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Buscar moldura..."
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-pink-500/40"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/45">
        <span>
          {AVATAR_FRAMES.length} molduras · {FREE_AVATAR_FRAME_COUNT} grátis
        </span>
        {hasFullAccess ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-amber-200">
            <Crown className="h-3 w-3" /> Premium
          </span>
        ) : (
          <span className="text-white/35">Premium desbloqueia o restante</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => selectFrame(null)}
          className={cn(
            "flex aspect-square flex-col items-center justify-center rounded-xl border p-1 transition",
            !profile.avatar_frame_id
              ? "border-pink-500/50 bg-pink-500/10"
              : "border-white/[0.08] bg-white/[0.03] hover:border-white/15",
          )}
        >
          <X className="h-4 w-4 text-white/45" />
          <span className="mt-1 text-[9px] text-white/45">Nenhuma</span>
        </button>

        {pageItems.map((frame) => {
          const locked = isAvatarFrameLocked(frame, profile);
          const selected = profile.avatar_frame_id === frame.id;

          return (
            <button
              key={frame.id}
              type="button"
              onClick={() => selectFrame(frame.id)}
              title={frame.name}
              className={cn(
                "relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border p-1 transition",
                selected
                  ? "border-pink-500/50 bg-pink-500/10 ring-1 ring-pink-500/30"
                  : "border-white/[0.08] bg-white/[0.03] hover:border-white/15",
                locked && "cursor-not-allowed",
              )}
            >
              <div className="relative flex h-12 w-12 items-center justify-center">
                <div className="h-9 w-9 overflow-hidden rounded-full bg-white/10">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <img
                  src={frame.url}
                  alt=""
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 select-none",
                    locked && "opacity-40 blur-[1px]",
                  )}
                  style={{ width: 44, height: 44 }}
                  draggable={false}
                  loading="lazy"
                  title={frame.name}
                />
              </div>
              {locked && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <Lock className="h-4 w-4 text-white/70" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 text-xs text-white/55">
          <button
            type="button"
            disabled={safePage <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-lg border border-white/10 px-3 py-1.5 disabled:opacity-40"
          >
            Anterior
          </button>
          <span>
            {safePage + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="rounded-lg border border-white/10 px-3 py-1.5 disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
