export function formatMusicTime(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const mm = Math.floor(safe / 60);
  const ss = safe % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

export function extractTrackName(url: string): string {
  try {
    const clean = decodeURIComponent(url.split("?")[0] ?? url);
    const raw = clean.split("/").pop() ?? "Faixa";
    const withoutExt = raw.replace(/\.[a-z0-9]+$/i, "");
    return withoutExt.replace(/[-_]+/g, " ").trim() || "Faixa";
  } catch {
    return "Faixa";
  }
}

export function resolveMusicCardTitle(
  musicCardTitle: string | null | undefined,
  musicTitle: string | null | undefined,
  musicUrl: string,
): string {
  const custom = musicCardTitle?.trim();
  if (custom) return custom;
  const title = musicTitle?.trim();
  if (title) return title;
  return extractTrackName(musicUrl);
}

/** Largura do card do player (40–100% do card principal). */
export function getMusicCardWidthPct(raw: number | null | undefined): number {
  const pct = Number(raw ?? 100);
  if (!Number.isFinite(pct)) return 100;
  return Math.min(100, Math.max(40, Math.round(pct)));
}
