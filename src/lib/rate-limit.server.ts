import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AdminClient = SupabaseClient<Database>;

export async function consumeRateLimit(
  admin: AdminClient,
  bucket: string,
  maxHits: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await admin.rpc("consume_rate_limit", {
    p_bucket: bucket.slice(0, 200),
    p_max_hits: maxHits,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error("[consumeRateLimit]", bucket, error.message);
    return false;
  }

  return data === true;
}

export function rateLimitBucket(parts: string[]): string {
  return parts.filter(Boolean).join(":");
}
