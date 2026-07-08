import { useState, type ReactNode } from "react";
import type { Profile } from "@/lib/profile-storage";
import {
  badgeMonochromeCssFilter,
  buildRoleBadgeImageFilter,
  getRoleBadgeSizePx,
  getRoleIconFallbackUrl,
  getRoleIconUrl,
  getRoleTooltip,
  resolveRoleBadgeBloomColor,
  sortProfileRoles,
  type ProfileRoleAssignment,
} from "@/lib/profile-roles";
import { cn } from "@/lib/utils";

type Props = {
  profile: Profile;
  className?: string;
  align?: "left" | "center";
  size?: number;
};

function useBadgeSrc(iconFile: string) {
  const primary = getRoleIconUrl(iconFile);
  const fallback = getRoleIconFallbackUrl(iconFile);
  const [src, setSrc] = useState(primary);

  const onError = () => {
    setSrc((current) => (current === fallback ? current : fallback));
  };

  return { src, onError };
}

function BadgeHoverShell({
  tooltip,
  size,
  children,
}: {
  tooltip: string;
  size: number;
  children: ReactNode;
}) {
  return (
    <span
      className="group/badge relative inline-flex shrink-0 cursor-default isolation-isolate"
      style={{ width: size, height: size }}
      aria-label={tooltip}
    >
      <span
        className={cn(
          "flex h-full w-full items-center justify-center transition-[transform,filter] duration-200",
          "group-hover/badge:scale-110 group-hover/badge:drop-shadow-[0_0_7px_rgba(255,255,255,0.65)]",
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
}: {
  role: ProfileRoleAssignment;
  monochrome: boolean;
  monoColor: string;
  size: number;
  bloom: boolean;
  bloomColor: string;
}) {
  const { src, onError } = useBadgeSrc(role.icon_file);
  const tooltip = getRoleTooltip(role);
  const monoFilter = monochrome ? badgeMonochromeCssFilter(monoColor) : undefined;
  const imageFilter = buildRoleBadgeImageFilter(size, {
    monochromeFilter: monoFilter,
    bloom,
    bloomColor,
  });

  return (
    <BadgeHoverShell tooltip={tooltip} size={size}>
      <img
        src={src}
        alt=""
        draggable={false}
        onError={onError}
        className="block h-full w-full object-contain object-center"
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          overflow: "visible",
          filter: imageFilter,
        }}
        loading="lazy"
      />
    </BadgeHoverShell>
  );
}

export function ProfileRoleBadges({
  profile,
  className,
  align = "center",
  size,
}: Props) {
  if (profile.show_role_badges === false) return null;

  const roles = sortProfileRoles(profile.roles ?? []);
  if (roles.length === 0) return null;

  const badgeSize = size ?? getRoleBadgeSizePx(profile);
  const monochrome = profile.role_badges_monochrome === true;
  const monoColor = profile.role_badges_mono_color ?? "#ffffff";
  const bloom = profile.role_badges_bloom === true;
  const bloomColor = resolveRoleBadgeBloomColor(profile);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-0.5",
        align === "center" ? "justify-center" : "justify-start",
        className,
      )}
      aria-label="Profile roles"
    >
      {roles.map((role) => (
        <RoleBadgeIcon
          key={role.id}
          role={role}
          monochrome={monochrome}
          monoColor={monoColor}
          size={badgeSize}
          bloom={bloom}
          bloomColor={bloomColor}
        />
      ))}
    </div>
  );
}
