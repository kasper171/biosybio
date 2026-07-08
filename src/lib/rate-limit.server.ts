import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AdminClient = SupabaseClient<Database>;

export type RateLimitOutcome =
  | { kind: "allowed" }
  | { kind: "denied" }
  /** RPC ausente ou erro de DB — não confundir com rate limit real. */
  | { kind: "unavailable"; reason: string };

function isMissingRateLimitRpc(error: { code?: string; message?: string }): boolean {
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST202" ||
    msg.includes("could not find the function") ||
    msg.includes("function public.consume_rate_limit") ||
    msg.includes("does not exist")
  );
}

export async function consumeRateLimit(
  admin: AdminClient,
  bucket: string,
  maxHits: number,
  windowSeconds: number,
): Promise<RateLimitOutcome> {
  const { data, error } = await admin.rpc("consume_rate_limit", {
    p_bucket: bucket.slice(0, 200),
    p_max_hits: maxHits,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    if (isMissingRateLimitRpc(error)) {
      console.warn("[consumeRateLimit] RPC not deployed, skipping bucket:", bucket);
      return { kind: "unavailable", reason: error.message };
    }
    console.error("[consumeRateLimit]", bucket, error.message);
    return { kind: "unavailable", reason: error.message };
  }

  if (data === true) return { kind: "allowed" };
  return { kind: "denied" };
}

export function rateLimitBucket(parts: string[]): string {
  return parts.filter(Boolean).join(":");
}
