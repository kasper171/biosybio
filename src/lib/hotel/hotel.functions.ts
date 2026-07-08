import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { fetchHabboProfile } from "@/lib/hotel/habbo-service";
import { fetchHabbletProfile } from "@/lib/hotel/habblet-service";
import type { HotelFetchResult } from "@/lib/hotel/types";
import { requireAuthenticatedUserId } from "@/lib/require-auth.server";
import { consumeRateLimit, rateLimitBucket } from "@/lib/rate-limit.server";

const fetchHotelInput = z.object({
  platform: z.enum(["habbo", "habblet"]),
  username: z.string().min(1).max(64),
  hotelDomain: z.string().optional(),
  fresh: z.boolean().optional(),
});

export const fetchHotelProfileFn = createServerFn({ method: "POST" })
  .inputValidator(fetchHotelInput)
  .handler(async ({ data }): Promise<HotelFetchResult> => {
    const userId = await requireAuthenticatedUserId();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const allowed = await consumeRateLimit(
      supabaseAdmin,
      rateLimitBucket(["hotel-fetch", userId]),
      20,
      60,
    );
    if (!allowed) {
      return {
        ok: false,
        error: "service_unavailable",
        message: "Too many requests. Try again in a moment.",
      };
    }

    const fresh = data.fresh === true;
    if (data.platform === "habblet") {
      return fetchHabbletProfile(data.username, { fresh });
    }
    return fetchHabboProfile(data.username, data.hotelDomain ?? "com.br", { fresh });
  });
