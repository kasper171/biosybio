import { createHash } from "node:crypto";

/** Janela de deduplicação de visualizações (1 view por perfil / visitante ou IP). */
export const PROFILE_VIEW_DEDUP_WINDOW_HOURS = 24;

export const PROFILE_VIEW_DEDUP_WINDOW_MS = PROFILE_VIEW_DEDUP_WINDOW_HOURS * 60 * 60 * 1000;

export function profileViewDedupCutoffIso(nowMs = Date.now()): string {
  return new Date(nowMs - PROFILE_VIEW_DEDUP_WINDOW_MS).toISOString();
}

/** Hash do IP no servidor — IP bruto não é gravado no banco. */
export function hashProfileViewClientIp(ip: string): string {
  const pepper =
    process.env.VIEW_DEDUP_PEPPER ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "byosy-view-dedup-v1";
  const normalized = ip.trim().slice(0, 64) || "unknown";
  return createHash("sha256").update(`${pepper}:${normalized}`).digest("hex");
}
