import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/profile-storage";
import { buildSubtleGlowFilter } from "@/lib/logo-glow-filter";
import badgeManifest from "@/generated/badges.manifest.json";

export type ProfileRoleId = "staff" | "staff_dev" | "premium" | "donator" | "gifter";

export type ProfileRoleAssignment = {
  id: string;
  role_id: ProfileRoleId;
  granted_at: string;
  label: string;
  icon_file: string;
  sort_order: number;
  tooltip_template: string;
  grants_full_access: boolean;
};

export const FULL_ACCESS_ROLE_IDS: ReadonlySet<ProfileRoleId> = new Set([
  "staff",
  "staff_dev",
  "premium",
  "donator",
  "gifter",
]);

const ROLE_ICON_BASE = "/badges";

export const BADGE_ICON_EXTENSIONS = [".svg", ".png", ".webp"] as const;

export function normalizeBadgeBase(iconFile: string): string {
  return iconFile.replace(/\.(svg|png|webp)$/i, "");
}

export function isRoleBadgeSvg(iconFileOrUrl: string): boolean {
  return /\.svg(\?|$)/i.test(iconFileOrUrl);
}

/** Bounding box da arte dentro do viewBox — premium é a referência visual. */
const ROLE_BADGE_ART_BBOX: Record<
  string,
  { minX: number; minY: number; maxX: number; maxY: number; vb: number }
> = {
  premium: { minX: 40, minY: 30, maxX: 160, maxY: 175, vb: 200 },
  staffdev: { minX: 25, minY: 45, maxX: 175, maxY: 155, vb: 200 },
  gifter: { minX: 35, minY: 20, maxX: 165, maxY: 185, vb: 200 },
  donator: { minX: 196, minY: 281, maxX: 828, maxY: 762, vb: 1024 },
  staff: { minX: 18, minY: 12, maxX: 182, maxY: 188, vb: 200 },
};

function badgeMaxFillRatio(bbox: (typeof ROLE_BADGE_ART_BBOX)[string]): number {
  const w = (bbox.maxX - bbox.minX) / bbox.vb;
  const h = (bbox.maxY - bbox.minY) / bbox.vb;
  return Math.max(w, h);
}

function badgeHeightFillRatio(bbox: (typeof ROLE_BADGE_ART_BBOX)[string]): number {
  return (bbox.maxY - bbox.minY) / bbox.vb;
}

/**
 * Escala para todas as badges ocuparem o mesmo slot visual que premium.svg.
 * Donator usa altura (arte mais “solta” dentro do bbox largo).
 */
export function getRoleBadgeVisualScale(iconFile: string): number {
  const id = normalizeBadgeBase(iconFile);
  const art = ROLE_BADGE_ART_BBOX[id];
  if (!art) return 1;

  const ref = ROLE_BADGE_ART_BBOX.premium;
  const refMax = badgeMaxFillRatio(ref);
  const refHeight = badgeHeightFillRatio(ref);

  if (id === "donator") {
    const artHeight = badgeHeightFillRatio(art);
    return artHeight > 0 ? refHeight / artHeight : 1;
  }

  const artMax = badgeMaxFillRatio(art);
  return artMax > 0 ? refMax / artMax : 1;
}

/**
 * Referência visual das badges no card Discord (19.2 * scale 100% → 19px).
 * Badges de cargo usam o mesmo slot — sem sincronizar configurações do Discord.
 */
export const DISCORD_BADGE_REFERENCE_PX = 19;
/** +10% sobre a referência Discord (~21px no perfil). */
export const ROLE_BADGE_DISPLAY_PX = Math.round(DISCORD_BADGE_REFERENCE_PX * 1.1);
/** Render interno 2× e reduz no CSS — downscale mais nítido que exibir direto em ~19px */
export const ROLE_BADGE_SUPERSAMPLE = 2;
/** Compensa padding transparente nos assets para badges ficarem próximas com gap 0 */
export const ROLE_BADGE_OVERLAP_PX = 5;
export const ROLE_BADGE_GAP_MIN = 0;
export const ROLE_BADGE_GAP_MAX = 20;
export const ROLE_BADGE_GAP_DEFAULT = 0;

export type RoleBadgesPlacement = "below_name" | "inline_name" | "below_socials";

export const ROLE_BADGES_PLACEMENT_DEFAULT: RoleBadgesPlacement = "below_name";

export function normalizeRoleBadgesPlacement(value: unknown): RoleBadgesPlacement {
  if (value === "inline_name" || value === "below_socials" || value === "below_name") {
    return value;
  }
  return ROLE_BADGES_PLACEMENT_DEFAULT;
}

const VALID_PROFILE_ROLE_IDS = new Set<ProfileRoleId>([
  "staff",
  "staff_dev",
  "premium",
  "donator",
  "gifter",
]);

export function normalizeRoleBadgesHidden(raw: unknown): ProfileRoleId[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<ProfileRoleId>();
  const out: ProfileRoleId[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const id = item as ProfileRoleId;
    if (!VALID_PROFILE_ROLE_IDS.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function pruneRoleBadgesHidden(
  hidden: ProfileRoleId[],
  assignedRoleIds: ProfileRoleId[],
): ProfileRoleId[] {
  const assigned = new Set(assignedRoleIds);
  return hidden.filter((id) => assigned.has(id));
}

export function isRoleBadgeVisibleOnProfile(
  roleId: ProfileRoleId,
  hidden: ProfileRoleId[],
): boolean {
  return !hidden.includes(roleId);
}

export function toggleRoleBadgeHidden(
  roleId: ProfileRoleId,
  hidden: ProfileRoleId[],
): ProfileRoleId[] {
  if (hidden.includes(roleId)) {
    return hidden.filter((id) => id !== roleId);
  }
  return [...hidden, roleId];
}

export function getVisibleProfileRoles(
  profile: Pick<Profile, "roles" | "role_badges_hidden">,
): ProfileRoleAssignment[] {
  const hidden = new Set(normalizeRoleBadgesHidden(profile.role_badges_hidden));
  return sortProfileRoles((profile.roles ?? []).filter((r) => !hidden.has(r.role_id)));
}

export function getRoleBadgeGapPx(
  profile: Pick<Profile, "role_badges_gap">,
): number {
  const raw = Number(profile.role_badges_gap ?? ROLE_BADGE_GAP_DEFAULT);
  if (!Number.isFinite(raw)) return ROLE_BADGE_GAP_DEFAULT;
  return Math.min(
    ROLE_BADGE_GAP_MAX,
    Math.max(ROLE_BADGE_GAP_MIN, Math.round(raw)),
  );
}

/** Tamanho fixo das badges de cargo no perfil — ignora valor salvo no perfil. */
export function getRoleBadgeSizePx(
  _profile?: Pick<Profile, "role_badges_size_px">,
): number {
  return ROLE_BADGE_DISPLAY_PX;
}

/** Altura extra no bloco do nome (somente placement below_name). */
export function estimateRoleBadgesNameAreaHeight(
  profile: Pick<Profile, "show_role_badges" | "role_badges_placement" | "role_badges_hidden"> & {
    roles?: ProfileRoleAssignment[];
  },
): number {
  if (profile.show_role_badges === false) return 0;
  if (normalizeRoleBadgesPlacement(profile.role_badges_placement) !== "below_name") return 0;
  if (getVisibleProfileRoles(profile).length === 0) return 0;
  return getRoleBadgeSizePx(profile) + 4;
}

/** Altura das badges abaixo das redes + folga mínima antes do rodapé Discord. */
export function estimateRoleBadgesBelowSocialsHeight(
  profile: Pick<
    Profile,
    "show_role_badges" | "role_badges_placement" | "role_badges_gap" | "card_width" | "role_badges_hidden"
  > & { roles?: ProfileRoleAssignment[] },
  opts?: { rowWidth?: number },
): number {
  if (profile.show_role_badges === false) return 0;
  if (normalizeRoleBadgesPlacement(profile.role_badges_placement) !== "below_socials") return 0;
  const count = getVisibleProfileRoles(profile).length;
  if (!count) return 0;

  const badgeSize = getRoleBadgeSizePx(profile);
  const gap = Math.max(0, getRoleBadgeGapPx(profile) - ROLE_BADGE_OVERLAP_PX);
  const cardWidth = Number(profile.card_width) || 600;
  const rowWidth = opts?.rowWidth ?? Math.max(80, cardWidth - 48);
  const step = Math.max(1, badgeSize + gap);
  const itemsPerRow = Math.max(1, Math.floor((rowWidth + gap) / step));
  const rows = Math.ceil(count / itemsPerRow);

  return 4 + rows * badgeSize + Math.max(0, rows - 1) * 2 + 4;
}

export function resolveRoleBadgeBloomColor(
  profile: Pick<Profile, "role_badges_bloom_color" | "role_badges_mono_color" | "icon_color">,
): string {
  const custom = profile.role_badges_bloom_color?.trim();
  if (custom) return custom;
  return profile.role_badges_mono_color?.trim() || profile.icon_color?.trim() || "#ffffff";
}

export function buildRoleBadgeImageFilter(
  size: number,
  options: {
    monochromeFilter?: string;
    bloom?: boolean;
    bloomColor?: string;
  },
): string | undefined {
  const parts: string[] = [];
  if (options.monochromeFilter) parts.push(options.monochromeFilter);
  if (options.bloom && options.bloomColor) {
    parts.push(buildSubtleGlowFilter(options.bloomColor, size));
  }
  return parts.length > 0 ? parts.join(" ") : undefined;
}

export function getRoleIconUrl(iconFile: string): string {
  const base = normalizeBadgeBase(iconFile);
  const entry = (badgeManifest as Record<string, { file: string; v?: string } | string>)[base];
  const file = typeof entry === "string" ? entry : entry?.file ?? iconFile;
  const v = typeof entry === "object" && entry?.v ? `?v=${entry.v}` : "";
  return `${ROLE_ICON_BASE}/${file}${v}`;
}

/** Fallbacks quando manifest/DB ainda referenciam extensão antiga. */
export function getRoleIconFallbackUrls(iconFile: string): string[] {
  const base = normalizeBadgeBase(iconFile);
  const primary = getRoleIconUrl(iconFile).split("?")[0]!;
  const urls: string[] = [];

  for (const ext of BADGE_ICON_EXTENSIONS) {
    const url = `${ROLE_ICON_BASE}/${base}${ext}`;
    if (url !== primary) urls.push(url);
  }

  return urls;
}

export function profileHasFullAccess(profile: Pick<Profile, "is_premium" | "roles">): boolean {
  if (profile.is_premium === true) return true;
  return (profile.roles ?? []).some(
    (r) => r.grants_full_access || FULL_ACCESS_ROLE_IDS.has(r.role_id),
  );
}

export function formatRoleDatePt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function getRoleTooltip(role: ProfileRoleAssignment): string {
  const tpl = role.tooltip_template;
  if (tpl.includes("{date}")) {
    return tpl.replace("{date}", formatRoleDatePt(role.granted_at));
  }
  return tpl;
}

export function sortProfileRoles(roles: ProfileRoleAssignment[]): ProfileRoleAssignment[] {
  return [...roles].sort((a, b) => a.sort_order - b.sort_order || a.role_id.localeCompare(b.role_id));
}

/** Escurece/clareia hex para duotone monocromático */
export function shadeHexColor(hex: string, percent: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const nr = Math.round((t - r) * p + r);
  const ng = Math.round((t - g) * p + g);
  const nb = Math.round((t - b) * p + b);
  return `#${((1 << 24) + (nr << 16) + (ng << 8) + nb).toString(16).slice(1)}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "").trim();
  if (clean.length !== 6) return null;
  const n = parseInt(clean, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Filtro CSS na imagem da badge — preserva transparência, sem fundo quadrado */
export function badgeMonochromeCssFilter(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "grayscale(1) brightness(1.05) contrast(1.06)";

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    const bright = (0.72 + l * 0.55).toFixed(2);
    return `grayscale(1) brightness(${bright}) contrast(1.08)`;
  }

  const d = max - min;
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;

  const s = d / (1 - Math.abs(2 * l - 1));
  const hueRotate = Math.round(h - 40);
  const saturate = Math.round(Math.min(500, Math.max(80, s * 320 + 80)));
  const brightness = (0.78 + l * 0.4).toFixed(2);

  return `grayscale(1) sepia(1) hue-rotate(${hueRotate}deg) saturate(${saturate}%) brightness(${brightness}) contrast(1.06)`;
}

export async function fetchProfileRoles(profileId: string): Promise<ProfileRoleAssignment[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data, error } = await db
    .from("profile_roles")
    .select(
      `
      id,
      role_id,
      granted_at,
      profile_role_types (
        label,
        icon_file,
        sort_order,
        tooltip_template,
        grants_full_access
      )
    `,
    )
    .eq("profile_id", profileId)
    .order("granted_at", { ascending: true });

  if (error) {
    console.error("[fetchProfileRoles]", error.message);
    return [];
  }

  return sortProfileRoles(
    (data ?? []).flatMap((row) => {
      const rt = row.profile_role_types as {
        label: string;
        icon_file: string;
        sort_order: number;
        tooltip_template: string;
        grants_full_access: boolean;
      } | null;
      if (!rt) return [];
      return [
        {
          id: row.id as string,
          role_id: row.role_id as ProfileRoleId,
          granted_at: row.granted_at as string,
          label: rt.label,
          icon_file: rt.icon_file,
          sort_order: rt.sort_order,
          tooltip_template: rt.tooltip_template,
          grants_full_access: rt.grants_full_access,
        },
      ];
    }),
  );
}

export async function attachProfileRoles<T extends Profile>(profile: T): Promise<T> {
  const roles = await fetchProfileRoles(profile.id);
  return {
    ...profile,
    roles,
    is_premium: profile.is_premium || profileHasFullAccess({ ...profile, roles }),
  };
}
