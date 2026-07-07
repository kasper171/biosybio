import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/profile-storage";
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

/** Área quadrada uniforme na UI (Discord ~19px; cargo um pouco maior e padronizado) */
export const ROLE_BADGE_DISPLAY_PX = 32;

export function getRoleIconUrl(iconFile: string): string {
  const base = iconFile.replace(/\.(png|svg|webp)$/i, "");
  const entry = (badgeManifest as Record<string, { file: string; v?: string } | string>)[base];
  const file = typeof entry === "string" ? entry : entry?.file ?? iconFile;
  const v = typeof entry === "object" && entry?.v ? `?v=${entry.v}` : "";
  return `${ROLE_ICON_BASE}/${file}${v}`;
}

/** @deprecated use getRoleIconUrl — manifest já resolve a extensão correta */
export function getRoleIconFallbackUrl(iconFile: string): string {
  return getRoleIconUrl(iconFile);
}

export function profileHasFullAccess(profile: Pick<Profile, "is_premium" | "roles">): boolean {
  if (profile.is_premium === true) return true;
  return (profile.roles ?? []).some(
    (r) => r.grants_full_access || FULL_ACCESS_ROLE_IDS.has(r.role_id),
  );
}

export function formatRoleDatePt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
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

/** Filtro CSS só no pixel do PNG — preserva transparência, sem fundo quadrado */
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
