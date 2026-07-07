/** Escala do nome/título nos cards Habbo e Habblet (+10%). */
export const HOTEL_USERNAME_TITLE_SCALE = 1.1;

const scaled = (px: number) => `${+(px * HOTEL_USERNAME_TITLE_SCALE).toFixed(1)}px`;

/** Classes de tamanho do nome do jogador nos cards de hotel. */
export const HOTEL_USERNAME_SIZE = {
  portraitCompact: scaled(12),
  portrait: scaled(14),
  sm: scaled(14),
  md: scaled(16),
  lg: scaled(18),
} as const;

/** Rótulo do hotel no topo do card (habbo.com.br / habblet.city). */
export const HOTEL_BORDER_LABEL_SIZE = {
  compact: scaled(7),
  default: scaled(8),
} as const;

/** Intervalo entre sincronizações automáticas com a API (30 min). */
export const HOTEL_SYNC_INTERVAL_MS = 30 * 60 * 1000;

export function isHotelSyncDue(
  syncedAt: string | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (!syncedAt) return true;
  const ts = Date.parse(syncedAt);
  if (!Number.isFinite(ts)) return true;
  return nowMs - ts >= HOTEL_SYNC_INTERVAL_MS;
}
