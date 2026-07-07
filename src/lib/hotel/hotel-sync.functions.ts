import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { fetchHabboProfile } from "@/lib/hotel/habbo-service";
import { fetchHabbletProfile } from "@/lib/hotel/habblet-service";
import { HOTEL_SYNC_INTERVAL_MS, isHotelSyncDue } from "@/lib/hotel/hotel-display";
import {
  habboDataToProfilePatch,
  habbletDataToProfilePatch,
  isHabboConnected,
  isHabbletConnected,
} from "@/lib/hotel/profile-hotel";
import type { Profile } from "@/lib/profile-storage";

const syncInput = z.object({
  profileId: z.string().uuid(),
  /** Ignora o intervalo de 30 min (ex.: intervalo do cliente). */
  force: z.boolean().optional(),
});

type HotelSyncRow = Pick<
  Profile,
  | "id"
  | "habbo_username"
  | "habbo_domain"
  | "habbo_figure"
  | "habblet_username"
  | "habblet_figure"
  | "habbo_synced_at"
  | "habblet_synced_at"
>;

export const syncProfileHotelDataFn = createServerFn({ method: "POST" })
  .inputValidator(syncInput)
  .handler(async ({ data }) => {
    const force = data.force === true;

    let supabaseAdmin: Awaited<
      typeof import("@/integrations/supabase/client.server")
    >["supabaseAdmin"];
    try {
      ({ supabaseAdmin } = await import("@/integrations/supabase/client.server"));
    } catch {
      return { ok: false as const, error: "server_misconfigured" as const, patch: null };
    }

    const { data: row, error } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, habbo_username, habbo_domain, habbo_figure, habblet_username, habblet_figure, habbo_synced_at, habblet_synced_at",
      )
      .eq("id", data.profileId)
      .maybeSingle();

    if (error || !row) {
      return { ok: false as const, error: "profile_not_found" as const, patch: null };
    }

    const profile = row as HotelSyncRow & Record<string, unknown>;
    const draft = profile as unknown as Profile;

    if (!isHabboConnected(draft) && !isHabbletConnected(draft)) {
      return { ok: true as const, skipped: true as const, patch: null };
    }

    const nowIso = new Date().toISOString();
    const patch: Record<string, unknown> = {};
    const synced: ("habbo" | "habblet")[] = [];

    if (isHabboConnected(draft)) {
      const due = force || isHotelSyncDue(profile.habbo_synced_at as string | null);
      if (due && profile.habbo_username) {
        const result = await fetchHabboProfile(
          profile.habbo_username,
          profile.habbo_domain ?? "com.br",
          { fresh: true },
        );
        if (result.ok) {
          Object.assign(patch, habboDataToProfilePatch(result.data));
          patch.habbo_synced_at = nowIso;
          synced.push("habbo");
        }
      }
    }

    if (isHabbletConnected(draft)) {
      const due = force || isHotelSyncDue(profile.habblet_synced_at as string | null);
      if (due && profile.habblet_username) {
        const result = await fetchHabbletProfile(profile.habblet_username, { fresh: true });
        if (result.ok) {
          Object.assign(patch, habbletDataToProfilePatch(result.data));
          patch.habblet_synced_at = nowIso;
          synced.push("habblet");
        }
      }
    }

    if (!Object.keys(patch).length) {
      return { ok: true as const, skipped: true as const, patch: null, synced };
    }

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(patch)
      .eq("id", data.profileId);

    if (updateError) {
      return { ok: false as const, error: "update_failed" as const, patch: null };
    }

    return {
      ok: true as const,
      skipped: false as const,
      patch: patch as Partial<Profile>,
      synced,
      intervalMs: HOTEL_SYNC_INTERVAL_MS,
    };
  });
