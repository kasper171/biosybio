import { useEffect, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type CommentRow = {
  id: number;
  profile_id: string;
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  content: string;
  is_visible: boolean;
  created_at: string;
};

type Props = {
  profileId: string;
  enabled: boolean;
};

export function ProfileCommentsSection({ profileId, enabled }: Props) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState("User");
  const [authorAvatar, setAuthorAvatar] = useState<string | null>(null);
  const [ownComment, setOwnComment] = useState<CommentRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const active = comments.length > 0 ? comments[idx % comments.length] : null;

  const loadComments = async () => {
    if (!enabled) {
      setComments([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("profile_comments")
      .select("*")
      .eq("profile_id", profileId)
      .eq("is_visible", true)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (!error) setComments((data as CommentRow[]) ?? []);
  };

  const loadOwnComment = async (userId: string | null) => {
    if (!userId) {
      setOwnComment(null);
      return;
    }
    const { data, error } = await supabase
      .from("profile_comments")
      .select("*")
      .eq("profile_id", profileId)
      .eq("author_id", userId)
      .maybeSingle();
    if (!error) {
      setOwnComment((data as CommentRow | null) ?? null);
    }
  };

  useEffect(() => {
    void loadComments();
  }, [profileId, enabled]);

  useEffect(() => {
    void loadOwnComment(currentUserId);
  }, [currentUserId, profileId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((v) => v + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      setCurrentUserId(u?.id ?? null);
      if (!u) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("display_name, username, avatar_url")
        .eq("id", u.id)
        .maybeSingle();
      setAuthorName(
        (p?.display_name as string | undefined)
          || (p?.username as string | undefined)
          || (u.user_metadata?.username as string | undefined)
          || "User",
      );
      setAuthorAvatar((p?.avatar_url as string | null | undefined) ?? null);
    })();
  }, []);

  const sendComment = async () => {
    const text = content.trim();
    if (!currentUserId) return;
    if (!text) return;
    if (ownComment) return;
    const { error } = await supabase
      .from("profile_comments")
      .insert({
        profile_id: profileId,
        author_id: currentUserId,
        content: text,
      });
    if (!error) {
      setContent("");
      setFormOpen(false);
      await loadComments();
      await loadOwnComment(currentUserId);
    }
  };

  const deleteMyComment = async () => {
    if (!ownComment) return;
    const { error } = await supabase
      .from("profile_comments")
      .delete()
      .eq("id", ownComment.id);
    if (!error) {
      await loadComments();
      await loadOwnComment(currentUserId);
    }
  };

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 z-[40] w-full">
      <div className="pointer-events-auto mx-auto w-full max-w-xl px-3 pb-2 text-center">
        <div className="mt-1 min-h-[64px]">
          {loading && <p className="text-xs text-white/50">Loading...</p>}
          {!loading && active && (
            <div key={active.id} className="animate-[biosy-comment-fade_450ms_ease]">
              <div className="mb-1 flex items-center justify-center gap-2">
                <div className="h-8 w-8 overflow-hidden rounded-full border border-white/20 bg-white/10">
                  {active.author_avatar_url ? (
                    <img src={active.author_avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <p className="text-xs font-semibold text-white">{active.author_name}</p>
              </div>
              <p className="mx-auto max-w-md text-sm text-white/85">{active.content}</p>
            </div>
          )}
          {!loading && !active && null}
        </div>

        <div className="mt-1 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setFormOpen((v) => !v)}
            className="grid h-7 w-7 place-items-center rounded-full border border-white/20 bg-black/35 text-white transition hover:bg-black/55"
            title="Comment"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/65">Comments</p>
          {currentUserId && ownComment && (
            <button
              type="button"
              onClick={() => void deleteMyComment()}
              className="rounded-md border border-red-300/30 px-2 py-1 text-[11px] text-red-200 transition hover:bg-red-500/20"
            >
              Delete
            </button>
          )}
        </div>
        {!loading && !active && (
          <p className="mt-1 text-[11px] text-white/50">No comments published right now</p>
        )}

        {formOpen && (
          <div className="mx-auto mt-2 max-w-md rounded-lg border border-white/15 bg-black/50 p-2 text-left backdrop-blur-sm">
            {!currentUserId && (
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-white/65">Sign in to comment.</p>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="grid h-7 w-7 place-items-center rounded-md text-white/70 transition hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {currentUserId && !ownComment && (
              <div className="flex items-center gap-2">
                <input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={280}
                  placeholder="Comment..."
                  className="w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-pink-500/60"
                />
                <button
                  type="button"
                  onClick={() => void sendComment()}
                  className="grid h-8 w-8 place-items-center rounded-md bg-white text-black transition hover:bg-white/90"
                  title="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-md text-white/70 transition hover:bg-white/10"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {currentUserId && ownComment && (
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-white/60">You already commented on this profile.</p>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="grid h-7 w-7 place-items-center rounded-md text-white/70 transition hover:bg-white/10"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

