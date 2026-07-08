import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getClientIp } from "@/lib/get-client-ip.server";
import { consumeRateLimit, rateLimitBucket } from "@/lib/rate-limit.server";

const profileLinkClickInput = z.object({
  profileId: z.string().uuid(),
  socialKey: z.string().min(1).max(64),
  visitorId: z.string().uuid(),
});

export const incrementProfileLinkClickFn = createServerFn({ method: "POST" })
  .inputValidator(profileLinkClickInput)
  .handler(async ({ data }) => {
    let supabaseAdmin: Awaited<
      typeof import("@/integrations/supabase/client.server")
    >["supabaseAdmin"];
    try {
      ({ supabaseAdmin } = await import("@/integrations/supabase/client.server"));
    } catch {
      console.error("[incrementProfileLinkClickFn] Supabase server env missing.");
      return { ok: false as const };
    }

    const clientIp = getClientIp();

    const ipAllowed = await consumeRateLimit(
      supabaseAdmin,
      rateLimitBucket(["click", "ip", clientIp]),
      120,
      60,
    );
    if (ipAllowed.kind === "denied") {
      return { ok: false as const, rateLimited: true as const };
    }

    const { data: existingDedup } = await supabaseAdmin
      .from("profile_link_click_dedup")
      .select("profile_id")
      .eq("profile_id", data.profileId)
      .eq("visitor_id", data.visitorId)
      .eq("social_key", data.socialKey)
      .maybeSingle();

    if (existingDedup) {
      return { ok: true as const, skipped: true as const };
    }

    const { error: dedupError } = await supabaseAdmin.from("profile_link_click_dedup").insert({
      profile_id: data.profileId,
      visitor_id: data.visitorId,
      social_key: data.socialKey,
    });

    if (dedupError && dedupError.code !== "23505") {
      console.error("[incrementProfileLinkClickFn] dedup", dedupError.message);
      return { ok: false as const };
    }

    if (dedupError?.code === "23505") {
      return { ok: true as const, skipped: true as const };
    }

    const { error: eventError } = await supabaseAdmin
      .from("profile_link_click_events")
      .insert({
        profile_id: data.profileId,
        social_key: data.socialKey,
        visitor_id: data.visitorId,
      });

    if (!eventError) {
      return { ok: true as const };
    }

    const { error: rpcError } = await supabaseAdmin.rpc("increment_profile_link_click", {
      target_profile_id: data.profileId,
    });

    if (rpcError) {
      console.error("[incrementProfileLinkClickFn]", eventError.message, rpcError.message);
      return { ok: false as const };
    }

    return { ok: true as const };
  });
