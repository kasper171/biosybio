import '@tanstack/react-start/server-only';

import { ensureDcdnSyncScheduler } from "@/lib/discord/dcdn-sync.server";

let servicesStarted = false;

/** Idempotent startup for backend dcdn profile cache (per server instance). */
export function ensureDiscordServicesStarted(): void {
  if (servicesStarted) return;
  servicesStarted = true;
  ensureDcdnSyncScheduler();
}
