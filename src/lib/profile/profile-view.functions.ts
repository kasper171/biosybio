import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getClientIp } from "@/lib/get-client-ip.server";
import { consumeRateLimit, rateLimitBucket } from "@/lib/rate-limit.server";
import {
  hashProfileViewClientIp,
  profileViewDedupCutoffIso,
} from "@/lib/profile-view-dedup.server";

const profileViewInput = z.object({
  profileId: z.string().uuid(),
  visitorId: z.string().uuid(),
});

async function readViewCount(
  admin: Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"],
  profileId: string,
): Promise<number | null> {
  const { data: row } = await admin
    .from("profiles")
    .select("view_count")
    .eq("id", profileId)
    .maybeSingle();
  return row ? Number(row.view_count ?? 0) : null;
}

export const incrementProfileViewFn = createServerFn({ method: "POST" })
  .inputValidator(profileViewInput)
  .handler(async ({ data }) => {
    let supabaseAdmin: Awaited<
      typeof import("@/integrations/supabase/client.server")
    >["supabaseAdmin"];
    try {
      ({ supabaseAdmin } = await import("@/integrations/supabase/client.server"));
    } catch (error) {
      console.error("[incrementProfileViewFn] Supabase server env missing.", error);
      return { ok: false as const, viewCount: null, reason: "env" as const };
    }

    const dedupSince = profileViewDedupCutoffIso();
    const clientIp = getClientIp();
    const ipHash = hashProfileViewClientIp(clientIp);

    const [{ data: recentVisitor }, { data: recentIp }] = await Promise.all([
      supabaseAdmin
        .from("profile_view_dedup")
        .select("profile_id")
        .eq("profile_id", data.profileId)
        .eq("visitor_id", data.visitorId)
        .gte("counted_at", dedupSince)
        .maybeSingle(),
      supabaseAdmin
        .from("profile_view_ip_dedup")
        .select("profile_id")
        .eq("profile_id", data.profileId)
        .eq("ip_hash", ipHash)
        .gte("counted_at", dedupSince)
        .maybeSingle(),
    ]);

    if (recentVisitor || recentIp) {
      return {
        ok: true as const,
        viewCount: await readViewCount(supabaseAdmin, data.profileId),
        skipped: true as const,
        reason: recentIp ? ("ip_24h" as const) : ("visitor_24h" as const),
      };
    }

    const ipBucket = rateLimitBucket(["view", "ip", clientIp]);
    const ipMaxHits = clientIp === "unknown" ? 30 : 60;

    const ipAllowed = await consumeRateLimit(supabaseAdmin, ipBucket, ipMaxHits, 60);
    if (ipAllowed.kind === "denied") {
      return { ok: false as const, viewCount: null, rateLimited: true as const, reason: "ip" as const };
    }
    if (ipAllowed.kind === "unavailable") {
      console.warn("[incrementProfileViewFn] IP rate limit unavailable:", ipAllowed.reason);
    }

    const profileAllowed = await consumeRateLimit(
      supabaseAdmin,
      rateLimitBucket(["view", "profile", data.profileId]),
      200,
      60,
    );
    if (profileAllowed.kind === "denied") {
      return { ok: false as const, viewCount: null, rateLimited: true as const, reason: "profile" as const };
    }
    if (profileAllowed.kind === "unavailable") {
      console.warn("[incrementProfileViewFn] profile rate limit unavailable:", profileAllowed.reason);
    }

    const countedAt = new Date().toISOString();

    const { error: visitorDedupError } = await supabaseAdmin.from("profile_view_dedup").upsert(
      {
        profile_id: data.profileId,
        visitor_id: data.visitorId,
        counted_at: countedAt,
      },
      { onConflict: "profile_id,visitor_id" },
    );

    if (visitorDedupError) {
      console.error("[incrementProfileViewFn] visitor dedup", visitorDedupError.message);
      return { ok: false as const, viewCount: null, reason: "dedup" as const };
    }

    const { error: ipDedupError } = await supabaseAdmin.from("profile_view_ip_dedup").upsert(
      {
        profile_id: data.profileId,
        ip_hash: ipHash,
        counted_at: countedAt,
      },
      { onConflict: "profile_id,ip_hash" },
    );

    if (ipDedupError) {
      console.error("[incrementProfileViewFn] ip dedup", ipDedupError.message);
      await supabaseAdmin
        .from("profile_view_dedup")
        .delete()
        .eq("profile_id", data.profileId)
        .eq("visitor_id", data.visitorId);
      return { ok: false as const, viewCount: null, reason: "dedup" as const };
    }

    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc("increment_profile_view", {
      target_profile_id: data.profileId,
    });

    if (rpcError) {
      console.error("[incrementProfileViewFn] rpc", rpcError.message);
      await supabaseAdmin
        .from("profile_view_dedup")
        .delete()
        .eq("profile_id", data.profileId)
        .eq("visitor_id", data.visitorId);
      await supabaseAdmin
        .from("profile_view_ip_dedup")
        .delete()
        .eq("profile_id", data.profileId)
        .eq("ip_hash", ipHash);
      return { ok: false as const, viewCount: null, reason: "rpc" as const };
    }

    const { error: eventError } = await supabaseAdmin.from("profile_view_events").insert({
      profile_id: data.profileId,
      visitor_id: data.visitorId,
    });
    if (eventError) {
      console.warn("[incrementProfileViewFn] event audit", eventError.message);
    }

    const viewCount = typeof rpcData === "number" ? rpcData : Number(rpcData);
    return {
      ok: true as const,
      viewCount: Number.isFinite(viewCount) ? viewCount : null,
    };
  });
