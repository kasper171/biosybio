import { useState, type ReactNode } from "react";
import type { Profile } from "@/lib/profile-storage";
import {
  badgeMonochromeCssFilter,
  buildRoleBadgeImageFilter,
  getRoleBadgeGapPx,
  getRoleBadgeSizePx,
  getRoleBadgeVisualScale,
  getRoleIconFallbackUrls,
  getRoleIconUrl,
  getVisibleProfileRoles,
  isRoleBadgeSvg,
  getRoleTooltip,
  resolveRoleBadgeBloomColor,
  ROLE_BADGE_OVERLAP_PX,
  ROLE_BADGE_SUPERSAMPLE,
  type ProfileRoleAssignment,
} from "@/lib/profile-roles";
import { cn } from "@/lib/utils";

type Props = {
  profile: Profile;
  className?: string;
  align?: "left" | "center";
};

function useBadgeSrc(iconFile: string) {
  const primary = getRoleIconUrl(iconFile);
  const fallbacks = getRoleIconFallbackUrls(iconFile);
  const [index, setIndex] = useState(0);
  const candidates = [primary, ...fallbacks];
  const src = candidates[Math.min(index, candidates.length - 1)] ?? primary;

  const onError = () => {
    setIndex((current) => Math.min(current + 1, candidates.length - 1));
  };

  return { src, onError };
}

function BadgeHoverShell({
  tooltip,
  size,
  marginLeft,
  children,
}: {
  tooltip: string;
  size: number;
  marginLeft: number;
  children: ReactNode;
}) {
  return (
    <span
      className="group/badge relative inline-flex shrink-0 cursor-default"
      style={{ width: size, height: size, marginLeft }}
      aria-label={tooltip}
    >
      <span
        className={cn(
          "flex h-full w-full items-center justify-center overflow-visible transition-transform duration-200",
          "group-hover/badge:scale-110",
        )}
      >
        {children}
      </span>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md",
          "border border-white/10 bg-black/90 px-2 py-1 text-[10px] font-medium text-white/90 shadow-lg",
          "opacity-0 transition-opacity duration-150 group-hover/badge:opacity-100",
        )}
      >
        {tooltip}
      </span>
    </span>
  );
}

function RoleBadgeIcon({
  role,
  monochrome,
  monoColor,
  size,
  bloom,
  bloomColor,
  marginLeft,
}: {
  role: ProfileRoleAssignment;
  monochrome: boolean;
  monoColor: string;
  size: number;
  bloom: boolean;
  bloomColor: string;
  marginLeft: number;
}) {
  const { src, onError } = useBadgeSrc(role.icon_file);
  const tooltip = getRoleTooltip(role);
  const visualScale = getRoleBadgeVisualScale(role.icon_file);
  const monoFilter = monochrome ? badgeMonochromeCssFilter(monoColor) : undefined;
  const imageFilter = buildRoleBadgeImageFilter(size, {
    monochromeFilter: monoFilter,
    bloom,
    bloomColor,
  });
  const isSvg = isRoleBadgeSvg(src);
  const supersample = isSvg ? 1 : ROLE_BADGE_SUPERSAMPLE;
  const renderSize = size * supersample;
  const imgSize = renderSize * visualScale;

  return (
    <BadgeHoverShell tooltip={tooltip} size={size} marginLeft={marginLeft}>
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
          style={{
            width: imgSize,
            height: imgSize,
            imageRendering: "auto",
          }}
          loading="lazy"
        />
      </span>
    </BadgeHoverShell>
  );
}

export function ProfileRoleBadges({
  profile,
  className,
  align = "center",
}: Props) {
  if (profile.show_role_badges === false) return null;

  const roles = getVisibleProfileRoles(profile);
  if (roles.length === 0) return null;

  const badgeSize = getRoleBadgeSizePx(profile);
  const badgeGap = getRoleBadgeGapPx(profile);
  const monochrome = profile.role_badges_monochrome === true;
  const monoColor = profile.role_badges_mono_color ?? "#ffffff";
  const bloom = profile.role_badges_bloom === true;
  const bloomColor = resolveRoleBadgeBloomColor(profile);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center",
        align === "center" ? "justify-center" : "justify-start",
        className,
      )}
      aria-label="Profile roles"
    >
      {roles.map((role, index) => (
        <RoleBadgeIcon
          key={role.id}
          role={role}
          monochrome={monochrome}
          monoColor={monoColor}
          size={badgeSize}
          bloom={bloom}
          bloomColor={bloomColor}
          marginLeft={index > 0 ? badgeGap - ROLE_BADGE_OVERLAP_PX : 0}
        />
      ))}
    </div>
  );
}
