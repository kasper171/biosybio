import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getTurnstileUserMessage } from "@/lib/turnstile/errors";
import { verifyTurnstileToken } from "@/lib/turnstile/verify.server";

const tokenInput = z.object({
  token: z.string().min(1),
});

const profileViewInput = z.object({
  profileId: z.string().uuid(),
  token: z.string().min(1),
});

export const verifyTurnstileFn = createServerFn({ method: "POST" })
  .inputValidator(tokenInput)
  .handler(async ({ data }) => {
    const verified = await verifyTurnstileToken(data.token);
    if (!verified.ok) {
      throw new Error(getTurnstileUserMessage(verified.code));
    }
    return { ok: true as const };
  });

export const incrementProfileViewFn = createServerFn({ method: "POST" })
  .inputValidator(profileViewInput)
  .handler(async ({ data }) => {
    const verified = await verifyTurnstileToken(data.token);
    if (!verified.ok) {
      return { ok: false as const, viewCount: null };
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      console.error("[incrementProfileViewFn] Supabase server env ausente.");
      return { ok: false as const, viewCount: null };
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: eventError } = await supabase
      .from("profile_view_events")
      .insert({ profile_id: data.profileId });

    if (!eventError) {
      const { data: row, error: readError } = await supabase
        .from("profiles")
        .select("view_count")
        .eq("id", data.profileId)
        .maybeSingle();
      if (!readError && row) {
        return { ok: true as const, viewCount: Number(row.view_count ?? 0) };
      }
      return { ok: true as const, viewCount: null };
    }

    const { data: rpcData, error: rpcError } = await supabase.rpc("increment_profile_view", {
      target_profile_id: data.profileId,
    });
    if (rpcError) {
      console.error("[incrementProfileViewFn]", eventError.message, rpcError.message);
      return { ok: false as const, viewCount: null };
    }

    const viewCount = typeof rpcData === "number" ? rpcData : Number(rpcData);
    return { ok: true as const, viewCount: Number.isFinite(viewCount) ? viewCount : null };
  });
