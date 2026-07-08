import { useState } from "react";
import type { Profile } from "@/lib/profile-storage";
import {
  badgeMonochromeCssFilter,
  buildRoleBadgeImageFilter,
  getRoleBadgeVisualScale,
  getRoleIconFallbackUrls,
  getRoleIconUrl,
  isRoleBadgeSvg,
  isRoleBadgeVisibleOnProfile,
  normalizeRoleBadgesHidden,
  pruneRoleBadgesHidden,
  ROLE_BADGE_SUPERSAMPLE,
  sortProfileRoles,
  toggleRoleBadgeHidden,
  type ProfileRoleAssignment,
  type ProfileRoleId,
} from "@/lib/profile-roles";
import { useI18n } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type Props = {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
};

function useBadgeSrc(iconFile: string) {
  const primary = getRoleIconUrl(iconFile);
  const fallbacks = getRoleIconFallbackUrls(iconFile);
  const [index, setIndex] = useState(0);
  const candidates = [primary, ...fallbacks];
  const src = candidates[Math.min(index, candidates.length - 1)] ?? primary;

  return {
    src,
    onError: () => setIndex((current) => Math.min(current + 1, candidates.length - 1)),
  };
}

function PickerBadge({
  role,
  visible,
  monochrome,
  monoColor,
  bloom,
  bloomColor,
  onToggle,
}: {
  role: ProfileRoleAssignment;
  visible: boolean;
  monochrome: boolean;
  monoColor: string;
  bloom: boolean;
  bloomColor: string;
  onToggle: () => void;
}) {
  const { src, onError } = useBadgeSrc(role.icon_file);
  const size = 40;
  const visualScale = getRoleBadgeVisualScale(role.icon_file);
  const monoFilter = monochrome ? badgeMonochromeCssFilter(monoColor) : undefined;
  const imageFilter = buildRoleBadgeImageFilter(size, {
    monochromeFilter: monoFilter,
    bloom: visible && bloom,
    bloomColor,
  });
  const isSvg = isRoleBadgeSvg(src);
  const supersample = isSvg ? 1 : ROLE_BADGE_SUPERSAMPLE;
  const renderSize = size * supersample;
  const imgSize = renderSize * visualScale;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={visible}
      aria-label={role.label}
      title={role.label}
      className={cn(
        "group flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2 transition",
        visible
          ? "border-white/20 bg-white/[0.06] hover:bg-white/[0.09]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]",
      )}
    >
      <span
        className={cn(
          "relative flex items-center justify-center overflow-visible transition duration-200",
          visible ? "opacity-100" : "opacity-35 grayscale",
        )}
        style={{ width: size, height: size }}
      >
        <span
          className="relative flex items-center justify-center overflow-visible"
          style={{
            width: renderSize,
            height: renderSize,
            transform: supersample > 1 ? `scale(${1 / supersample})` : undefined,
            transformOrigin: "center",
            filter: imageFilter,
          }}
        >
          <img
            src={src}
            alt=""
            draggable={false}
            onError={onError}
            width={imgSize}
            height={imgSize}
            decoding="async"
            className="block max-w-none object-contain object-center"
            style={{ width: imgSize, height: imgSize }}
          />
        </span>
      </span>
      <span
        className={cn(
          "max-w-[72px] truncate text-[10px] font-medium leading-tight",
          visible ? "text-white/80" : "text-white/35",
        )}
      >
        {role.label}
      </span>
    </button>
  );
}

export function RoleBadgesVisibilityPicker({ profile, update }: Props) {
  const { t } = useI18n();
  const roles = sortProfileRoles(profile.roles ?? []);
  const assignedIds = roles.map((r) => r.role_id);
  const hidden = pruneRoleBadgesHidden(
    normalizeRoleBadgesHidden(profile.role_badges_hidden),
    assignedIds,
  );

  const setHidden = (next: ProfileRoleId[]) => {
    update(
      "role_badges_hidden",
      pruneRoleBadgesHidden(next, assignedIds),
    );
  };

  const monochrome = profile.role_badges_monochrome === true;
  const monoColor = profile.role_badges_mono_color ?? "#ffffff";
  const bloom = profile.role_badges_bloom === true;
  const bloomColor =
    profile.role_badges_bloom_color?.trim() ||
    profile.role_badges_mono_color?.trim() ||
    profile.icon_color?.trim() ||
    "#ffffff";

  if (roles.length === 0) {
    return (
      <p className="text-[11px] text-white/35">
        {t("dashboard.perfil.roleBadges.noRolesAssigned")}
      </p>
    );
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-white/55">
        {t("dashboard.perfil.roleBadges.chooseVisible")}
      </p>
      <div className="flex flex-wrap gap-2">
        {roles.map((role) => {
          const visible = isRoleBadgeVisibleOnProfile(role.role_id, hidden);
          return (
            <PickerBadge
              key={role.id}
              role={role}
              visible={visible}
              monochrome={monochrome}
              monoColor={monoColor}
              bloom={bloom}
              bloomColor={bloomColor}
              onToggle={() => setHidden(toggleRoleBadgeHidden(role.role_id, hidden))}
            />
          );
        })}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-white/40">
        {t("dashboard.perfil.roleBadges.chooseVisibleHint")}
      </p>
    </div>
  );
}
