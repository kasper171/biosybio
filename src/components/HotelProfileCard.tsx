import type { CSSProperties } from "react";
import { motion } from "motion/react";
import type { Profile } from "@/lib/profile-storage";
import {
  buildCardGlowShadow,
  buildCardSolidBorderShadow,
  cardBorderStyleClass,
  combineBoxShadows,
  normalizeCardBorderStyle,
} from "@/lib/card-border";
import {
  getHotelBesideFrameStyle,
  getHotelBelowFrameStyle,
  getHotelCardBorderRadius,
  getHotelCardFrameStyle,
  HOTEL_AVATAR_SLOT,
  type HotelBesideSlot,
  type HotelBelowSlot,
  type HotelCardLayoutConfig,
  type HotelCardShape,
  type HotelCardSize,
} from "@/lib/hotel/hotel-card-layout";
import type { HotelProfileData } from "@/lib/hotel/types";
import { getHotelPlatformLabel } from "@/lib/hotel/hotels";
import {
  getDiscordMutedStyle,
  getDiscordTitleStyle,
  hexToRgba,
} from "@/lib/profile-colors";

type Props = {
  data: HotelProfileData;
  profile: Profile;
  layout: HotelCardLayoutConfig;
  variant?: "inside" | "outside";
  className?: string;
  /** Coluna portrait ao lado do card principal */
  besideSlot?: HotelBesideSlot;
  /** Faixa horizontal abaixo do card principal */
  belowSlot?: HotelBelowSlot;
};

function getCardChrome(
  profile: Profile,
  size: HotelCardSize,
  shape: HotelCardShape,
  borderRadius?: number,
): { style: CSSProperties; className: string } {
  const bw = Number(profile.card_border_width ?? 0);
  const bc = profile.card_border_color ?? "#ffffff";
  const borderStyle = normalizeCardBorderStyle(profile.card_border_style);
  const radius = borderRadius ?? getHotelCardBorderRadius(size, shape);
  const useCssBorder = bw > 0;

  const style: CSSProperties = {
    borderRadius: radius,
    background: hexToRgba(profile.card_color, profile.card_opacity),
    backdropFilter: `blur(${profile.card_blur}px)`,
    WebkitBackdropFilter: `blur(${profile.card_blur}px)`,
    boxSizing: "border-box",
    boxShadow: combineBoxShadows(
      useCssBorder ? null : buildCardSolidBorderShadow(bw, bc),
      buildCardGlowShadow(
        Boolean(profile.effect_glow),
        profile.effect_glow_color ?? profile.card_border_color,
        profile.effect_glow_size ?? 24,
      ),
    ),
  };

  if (useCssBorder) {
    style.borderWidth = bw;
    style.borderStyle = borderStyle;
    style.borderColor = bc;
  }

  return {
    style,
    className: useCssBorder ? cardBorderStyleClass(borderStyle) : "",
  };
}

function HotelBorderLabel({
  data,
  profile,
  align,
  compact,
}: {
  data: HotelProfileData;
  profile: Profile;
  align: "center" | "start";
  compact?: boolean;
}) {
  const label = getHotelPlatformLabel(data);
  const bg = hexToRgba(profile.card_color, Math.min(0.95, profile.card_opacity + 0.12));

  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute top-0 z-[5] max-w-[calc(100%-10px)] truncate rounded-full border border-white/[0.1] px-1.5 py-px font-medium leading-none text-white/50 backdrop-blur-sm ${
        compact ? "text-[7px] tracking-wide" : "text-[8px] tracking-wide"
      } ${align === "center" ? "left-1/2 -translate-x-1/2 -translate-y-1/2" : "left-2 -translate-y-1/2"}`}
      style={{ background: bg }}
    >
      {label}
    </span>
  );
}

function HotelStats({
  data,
  mutedStyle,
  bodySize,
}: {
  data: HotelProfileData;
  mutedStyle: CSSProperties;
  bodySize: string;
}) {
  const statTitle = data.platform === "habbo" ? "Current Level" : "Achievement Points";
  const statValue =
    data.platform === "habbo"
      ? data.level != null
        ? String(data.level)
        : null
      : data.achievementPoints != null
        ? data.achievementPoints.toLocaleString("pt-BR")
        : null;

  return (
    <>
      {data.motto ? (
        <p className={`line-clamp-2 italic leading-snug ${bodySize}`} style={mutedStyle}>
          {data.motto}
        </p>
      ) : null}
      {statValue ? (
        <p className={`mt-1 leading-snug ${bodySize}`} style={mutedStyle}>
          {statTitle}: {statValue}
        </p>
      ) : null}
    </>
  );
}

/** Portrait: nome em cima, avatar grande no centro, info embaixo */
function PortraitBesideContent({
  data,
  profile,
  compact,
}: {
  data: HotelProfileData;
  profile: Profile;
  compact: boolean;
}) {
  const titleStyle = getDiscordTitleStyle(profile);
  const mutedStyle = getDiscordMutedStyle(profile);
  const nameSize = compact ? "text-xs" : "text-sm";
  const bodySize = compact ? "text-[10px]" : "text-xs";

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <p
        className={`shrink-0 truncate px-2 pb-0.5 pt-3 text-center font-semibold leading-tight ${nameSize}`}
        style={titleStyle}
      >
        {data.username}
      </p>
      <div
        className={`relative flex min-h-0 flex-1 justify-center overflow-hidden px-1 ${
          compact ? "items-end" : "items-center"
        }`}
      >
        <img
          src={data.avatar}
          alt={data.username}
          className={
            compact
              ? "h-full w-auto max-w-full select-none object-contain object-bottom"
              : "max-h-[78%] w-auto max-w-[92%] select-none object-contain object-center"
          }
          draggable={false}
        />
      </div>
      <div className="shrink-0 px-2 pb-2 pt-1 text-center">
        <HotelStats data={data} mutedStyle={mutedStyle} bodySize={bodySize} />
      </div>
    </div>
  );
}

/** Landscape: avatar à esquerda, texto à direita */
function LandscapeContent({
  data,
  profile,
  layout,
}: {
  data: HotelProfileData;
  profile: Profile;
  layout: HotelCardLayoutConfig;
}) {
  const titleStyle = getDiscordTitleStyle(profile);
  const mutedStyle = getDiscordMutedStyle(profile);
  const slot = HOTEL_AVATAR_SLOT[layout.size];
  const horizontal = layout.shape === "rectangle";
  const nameSize = layout.size === "lg" ? "text-lg" : layout.size === "md" ? "text-base" : "text-sm";
  const bodySize = layout.size === "lg" ? "text-sm" : "text-xs";

  const avatar = (
    <div
      className="relative flex shrink-0 items-end justify-center overflow-hidden"
      style={{ width: slot.width, height: slot.height }}
    >
      <img
        src={data.avatar}
        alt={data.username}
        className="h-full w-auto max-w-none select-none object-contain object-bottom"
        draggable={false}
      />
    </div>
  );

  const text = (
    <div className={`min-w-0 flex-1 ${horizontal ? "text-left" : "text-center"}`}>
      <p className={`truncate font-semibold leading-tight ${nameSize}`} style={titleStyle}>
        {data.username}
      </p>
      <HotelStats data={data} mutedStyle={mutedStyle} bodySize={bodySize} />
    </div>
  );

  if (horizontal) {
    return (
      <div className="flex h-full w-full items-center gap-3 px-3 py-2 sm:gap-4 sm:px-4">
        {avatar}
        {text}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-between px-3 py-3 sm:px-4">
      <div className="flex flex-1 flex-col items-center justify-center gap-2">{avatar}</div>
      <div className="w-full pb-1">{text}</div>
    </div>
  );
}

function HotelCardContent({
  data,
  profile,
  layout,
  besideSlot,
  belowSlot,
}: {
  data: HotelProfileData;
  profile: Profile;
  layout: HotelCardLayoutConfig;
  besideSlot?: HotelBesideSlot;
  belowSlot?: HotelBelowSlot;
}) {
  if (besideSlot) {
    return (
      <PortraitBesideContent
        data={data}
        profile={profile}
        compact={besideSlot.slotCount === 2}
      />
    );
  }

  if (belowSlot) {
    return <LandscapeContent data={data} profile={profile} layout={layout} />;
  }

  return <LandscapeContent data={data} profile={profile} layout={layout} />;
}

export function HotelProfileCard({
  data,
  profile,
  layout,
  variant = "inside",
  className = "",
  besideSlot,
  belowSlot,
}: Props) {
  const mainRadius = Number(profile.card_border_radius ?? 16) || 16;
  const frameStyle = besideSlot
    ? getHotelBesideFrameStyle(profile, layout.size, layout.shape, true)
    : belowSlot
      ? getHotelBelowFrameStyle(profile, layout.size, layout.shape, true)
      : getHotelCardFrameStyle(layout.size, layout.shape);
  const chromeShape = layout.shape;
  const chrome =
    variant === "outside"
      ? getCardChrome(
          profile,
          layout.size,
          chromeShape,
          besideSlot || belowSlot ? mainRadius : undefined,
        )
      : null;

  const labelAlign = besideSlot ? "center" : "start";
  const labelCompact = besideSlot?.slotCount === 2;

  const inner = (
    <motion.div
      className={`group relative h-full w-full overflow-hidden transition duration-300 hover:brightness-[1.03] ${
        variant === "inside" ? "rounded-[inherit]" : ""
      }`}
      whileHover={{ scale: profile.effect_hover ? 1.01 : 1 }}
      transition={{ type: "spring", visualDuration: 0.35, bounce: 0.12 }}
    >
      <HotelCardContent
        data={data}
        profile={profile}
        layout={layout}
        besideSlot={besideSlot}
        belowSlot={belowSlot}
      />
    </motion.div>
  );

  const borderLabel = (
    <HotelBorderLabel
      data={data}
      profile={profile}
      align={labelAlign}
      compact={labelCompact}
    />
  );

  if (variant === "outside" && chrome) {
    return (
      <div className={`relative isolate ${className}`} style={frameStyle}>
        {borderLabel}
        <div
          className={`relative h-full w-full overflow-hidden ${chrome.className}`}
          style={{ ...chrome.style, borderRadius: frameStyle.borderRadius ?? mainRadius }}
        >
          {inner}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative mx-auto min-w-0 ${className}`} style={frameStyle}>
      {borderLabel}
      <div className="relative h-full w-full overflow-hidden rounded-[inherit]">{inner}</div>
    </div>
  );
}
