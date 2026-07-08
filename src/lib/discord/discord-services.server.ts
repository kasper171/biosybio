import '@tanstack/react-start/server-only';

import { ensureDcdnSyncScheduler } from "@/lib/discord/dcdn-sync.server";
import { ensureLanyardBridge } from "@/lib/discord/lanyard-bridge.server";

let servicesStarted = false;

/** Idempotent startup for backend Discord integrations (per server instance). */
export function ensureDiscordServicesStarted(): void {
  if (servicesStarted) return;
  servicesStarted = true;
  ensureDcdnSyncScheduler();
  ensureLanyardBridge();
}
