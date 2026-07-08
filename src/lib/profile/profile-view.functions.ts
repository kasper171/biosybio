import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getClientIp } from "@/lib/get-client-ip.server";
import { consumeRateLimit, rateLimitBucket } from "@/lib/rate-limit.server";

const profileViewInput = z.object({
  profileId: z.string().uuid(),
  visitorId: z.string().uuid(),
});

export const incrementProfileViewFn = createServerFn({ method: "POST" })
  .inputValidator(profileViewInput)
  .handler(async ({ data }) => {
    let supabaseAdmin: Awaited<
      typeof import("@/integrations/supabase/client.server")
    >["supabaseAdmin"];
    try {
      ({ supabaseAdmin } = await import("@/integrations/supabase/client.server"));
    } catch {
      console.error("[incrementProfileViewFn] Supabase server env missing.");
      return { ok: false as const, viewCount: null };
    }

    const clientIp = getClientIp();

    const ipAllowed = await consumeRateLimit(
      supabaseAdmin,
      rateLimitBucket(["view", "ip", clientIp]),
      60,
      60,
    );
    if (!ipAllowed) {
      return { ok: false as const, viewCount: null, rateLimited: true as const };
    }

    const profileAllowed = await consumeRateLimit(
      supabaseAdmin,
      rateLimitBucket(["view", "profile", data.profileId]),
      200,
      60,
    );
    if (!profileAllowed) {
      return { ok: false as const, viewCount: null, rateLimited: true as const };
    }

    const { data: existingDedup } = await supabaseAdmin
      .from("profile_view_dedup")
      .select("profile_id")
      .eq("profile_id", data.profileId)
      .eq("visitor_id", data.visitorId)
      .maybeSingle();

    if (existingDedup) {
      const { data: row } = await supabaseAdmin
        .from("profiles")
        .select("view_count")
        .eq("id", data.profileId)
        .maybeSingle();
      return {
        ok: true as const,
        viewCount: row ? Number(row.view_count ?? 0) : null,
        skipped: true as const,
      };
    }

    const { error: dedupError } = await supabaseAdmin.from("profile_view_dedup").insert({
      profile_id: data.profileId,
      visitor_id: data.visitorId,
    });

    if (dedupError) {
      if (dedupError.code === "23505") {
        const { data: row } = await supabaseAdmin
          .from("profiles")
          .select("view_count")
          .eq("id", data.profileId)
          .maybeSingle();
        return {
          ok: true as const,
          viewCount: row ? Number(row.view_count ?? 0) : null,
          skipped: true as const,
        };
      }
      console.error("[incrementProfileViewFn] dedup", dedupError.message);
      return { ok: false as const, viewCount: null };
    }

    const { error: eventError } = await supabaseAdmin
      .from("profile_view_events")
      .insert({ profile_id: data.profileId, visitor_id: data.visitorId });

    if (!eventError) {
      const { data: row, error: readError } = await supabaseAdmin
        .from("profiles")
        .select("view_count")
        .eq("id", data.profileId)
        .maybeSingle();
      if (!readError && row) {
        return { ok: true as const, viewCount: Number(row.view_count ?? 0) };
      }
      return { ok: true as const, viewCount: null };
    }

    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc("increment_profile_view", {
      target_profile_id: data.profileId,
    });
    if (rpcError) {
      console.error("[incrementProfileViewFn]", eventError.message, rpcError.message);
      return { ok: false as const, viewCount: null };
    }

    const viewCount = typeof rpcData === "number" ? rpcData : Number(rpcData);
    return { ok: true as const, viewCount: Number.isFinite(viewCount) ? viewCount : null };
  });
