import { getBlockFrameHeight } from "@/lib/block-frame";
import { getHotelCardFrameStyle, getHotelCardLayoutFromProfile } from "@/lib/hotel/hotel-card-layout";
import { listHotelConnections } from "@/lib/hotel/profile-hotel";
import type { ProfileBlock } from "@/lib/profile-blocks";
import { DEFAULT_CARD_HEIGHT, type Profile } from "@/lib/profile-storage";
import { hasActiveTextAnimation, normalizeTextAnimationId } from "@/lib/text-animations";

const BANNER_VISIBLE_RATIO = 0.34;
const BANNER_BEHIND_AVATAR_PX = 44;
const CARD_HEIGHT_STEP = 10;

export const CARD_HEIGHT_SLIDER_MAX = 800;
export const CARD_HEIGHT_ABSOLUTE_MIN = 280;

function countSocials(profile: Profile): number {
  return Object.values(profile.socials ?? {}).filter((v) => Boolean(v && String(v).trim())).length;
}

function estimateTextLines(text: string, contentWidth: number, charWidth: number): number {
  if (!text.trim()) return 0;
  const charsPerLine = Math.max(8, Math.floor(contentWidth / charWidth));
  return text.split("\n").reduce((n, line) => n + Math.max(1, Math.ceil(line.length / charsPerLine)), 0);
}

function estimateDiscordInsideHeight(profile: Profile): number {
  if (!profile.discord_user_id || profile.discord_card_mode === "outside") return 0;
  const scale = Math.min(140, Math.max(80, Number(profile.discord_inside_scale ?? 100) || 100)) / 100;
  return Math.round(20 + 52 * scale + 34);
}

function estimateHotelInsideFooterHeight(profile: Profile): number {
  const connections = listHotelConnections(profile);
  const layout = getHotelCardLayoutFromProfile(profile);
  if (!connections.length || layout.placement !== "inside") return 0;

  const frame = getHotelCardFrameStyle(layout.size, layout.shape);
  const cardH = typeof frame.height === "number" ? frame.height : 140;

  if (layout.row === "same_row" && connections.length > 1) return cardH;
  return cardH * connections.length + 12 * Math.max(0, connections.length - 1);
}

function estimateInsideBlocksHeight(blocks?: ProfileBlock[]): number {
  if (!blocks?.length) return 0;
  const inside = blocks.filter((b) => b.placement === "inside");
  if (!inside.length) return 0;

  let total = 12;
  for (let i = 0; i < inside.length; i++) {
    if (i > 0) total += 12;
    total += getBlockFrameHeight(inside[i]!);
  }
  return total;
}

function estimateFooterHeight(profile: Profile): number {
  const discordH = estimateDiscordInsideHeight(profile);
  const hotelH = estimateHotelInsideFooterHeight(profile);
  if (!discordH && !hotelH) return 0;

  const inner = discordH && hotelH ? discordH + 12 + hotelH : discordH || hotelH;
  return inner + 33;
}

function estimateSocialRowsHeight(profile: Profile, cardWidth: number): number {
  const count = countSocials(profile);
  if (!count) return 0;

  const icon = profile.social_icon_style === "logo" ? 36 : 44;
  const gap = 8;
  const rowWidth = cardWidth - 48;
  const rowNeeded = count * icon + (count - 1) * gap;
  if (rowNeeded <= rowWidth) {
    return 6 + icon;
  }
  return 6 + icon;
}

function roundCardHeight(h: number): number {
  return Math.ceil(h / CARD_HEIGHT_STEP) * CARD_HEIGHT_STEP;
}

/**
 * Altura mínima do card para caber todo o conteúdo sem scroll e sem sobreposição.
 */
export function estimateMinCardHeight(
  profile: Profile,
  opts?: { blocks?: ProfileBlock[] },
): number {
  const layout = profile.card_layout ?? "centered";
  const cardWidth = Number(profile.card_width) || 600;
  const avatarSize = Number(profile.avatar_size ?? 96);
  const hasBanner = Boolean(profile.inner_banner_url);
  const bio = profile.bio ?? "";
  const hasBioFx = hasActiveTextAnimation(normalizeTextAnimationId(profile.bio_text_animation));
  const hasNameFx = hasActiveTextAnimation(normalizeTextAnimationId(profile.name_text_animation));
  const showUsername = profile.show_username !== false;
  const showBadges = profile.show_role_badges !== false;

  let body = 0;

  if (layout === "aligned") {
    const socialCount = countSocials(profile);
    const socialIcon = profile.social_icon_style === "logo" ? 32 : 36;
    const socialUnderAvatar = socialCount > 0 ? 8 + socialIcon : 0;
    const frameOverflow = profile.avatar_frame_id ? Math.ceil(avatarSize * 0.11) : 0;
    const avatarCol = avatarSize + frameOverflow * 2 + socialUnderAvatar;
    const textWidth = Math.max(120, cardWidth - 48 - avatarSize - 16);
    const bioLines = estimateTextLines(bio, textWidth, 7);

    let textCol = 28 + (hasNameFx ? 16 : 0);
    if (showBadges) textCol += 28;
    if (showUsername) textCol += 20;
    textCol += bioLines * 18 + (bio ? 8 : 0) + (hasBioFx ? 16 : 0);

    body = Math.max(avatarCol, textCol) + 28;
  } else if (layout === "centered") {
    const avatar = Math.max(52, Math.round(avatarSize * 1.1));
    body += 64 + avatar + 16;
    body += 28 + (hasNameFx ? 16 : 0);
    if (showBadges) body += 28;
    if (showUsername) body += 20;

    const bioLines = estimateTextLines(bio, cardWidth - 48, 8);
    body += bioLines * 21 + (bio ? 8 : 0) + (hasBioFx ? 16 : 0);
    body += estimateSocialRowsHeight(profile, cardWidth);
  } else {
    const padTop = hasBanner ? 20 : 24;
    body += padTop + 24 + avatarSize + 12;
    body += 28 + (hasNameFx ? 16 : 0);
    if (showBadges) body += 28;
    if (showUsername) body += 20;

    const bioLines = estimateTextLines(bio, cardWidth - 48, 8);
    body += bioLines * 21 + (bio ? 8 : 0) + (hasBioFx ? 16 : 0);
    body += estimateSocialRowsHeight(profile, cardWidth);
  }

  body += estimateInsideBlocksHeight(opts?.blocks);
  body += estimateFooterHeight(profile);

  let cardH = body;
  if (hasBanner && layout === "default") {
    for (let i = 0; i < 10; i++) {
      const strip = Math.round(cardH * BANNER_VISIBLE_RATIO);
      const next = body + strip - BANNER_BEHIND_AVATAR_PX;
      if (next <= cardH) break;
      cardH = next;
    }
  }

  return Math.min(
    CARD_HEIGHT_SLIDER_MAX,
    Math.max(CARD_HEIGHT_ABSOLUTE_MIN, roundCardHeight(cardH)),
  );
}

export function clampCardHeight(
  profile: Profile,
  height: number,
  blocks?: ProfileBlock[],
): number {
  const min = estimateMinCardHeight(profile, { blocks });
  const stepped = roundCardHeight(height);
  return Math.min(CARD_HEIGHT_SLIDER_MAX, Math.max(min, stepped));
}
