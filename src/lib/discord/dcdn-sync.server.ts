import '@tanstack/react-start/server-only';

import { refreshDcdnProfile } from "@/lib/discord/dcdn-profile.server";
import { listTrackedDiscordUserIds } from "@/lib/discord/discord-tracked-ids.server";

const SYNC_INTERVAL_MS = 2 * 60 * 60 * 1000;

let syncTimer: ReturnType<typeof setInterval> | undefined;
let syncRunning = false;

export async function syncAllDcdnProfiles(): Promise<void> {
  if (syncRunning) return;
  syncRunning = true;
  try {
    const ids = await listTrackedDiscordUserIds();
    for (const userId of ids) {
      await refreshDcdnProfile(userId);
    }
  } catch (error) {
    console.warn("[syncAllDcdnProfiles]", error);
  } finally {
    syncRunning = false;
  }
}

export function ensureDcdnSyncScheduler(): void {
  if (syncTimer) return;
  void syncAllDcdnProfiles();
  syncTimer = setInterval(() => {
    void syncAllDcdnProfiles();
  }, SYNC_INTERVAL_MS);
  if (typeof syncTimer === "object" && "unref" in syncTimer) {
    syncTimer.unref();
  }
}
