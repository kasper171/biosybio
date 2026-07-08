import { AVATAR_FRAME_SCALE } from "@/lib/avatar-frames";
import { getBlockFrameHeight } from "@/lib/block-frame";
import { getHotelCardFrameStyle, getHotelCardLayoutFromProfile } from "@/lib/hotel/hotel-card-layout";
import { listHotelConnections } from "@/lib/hotel/profile-hotel";
import type { ProfileBlock } from "@/lib/profile-blocks";
import { DEFAULT_CARD_HEIGHT, type Profile } from "@/lib/profile-storage";
import { getRoleBadgeSizePx } from "@/lib/profile-roles";
import { getSocialIconDimensions, getSocialIconGapPx } from "@/lib/social-icons";

/** Mesmo limite visual do card (`line-clamp-3` na bio). */
const BIO_LINE_CLAMP = 3;

const BANNER_VISIBLE_RATIO = 0.34;
const BANNER_BEHIND_AVATAR_PX = 44;
const CARD_HEIGHT_STEP = 10;

/** Espelha paddings do ProfileCard (px-6 pt-4 pb-2). */
const ALIGNED_PADDING_Y = 24;

export const CARD_HEIGHT_SLIDER_MAX = 800;
export const CARD_HEIGHT_ABSOLUTE_MIN = 280;

function countSocials(profile: Profile): number {
  return Object.values(profile.socials ?? {}).filter((v) => Boolean(v && String(v).trim())).length;
}

function estimateTextLines(text: string, contentWidth: number, charWidth: number): number {
  if (!text.trim()) return 0;
  const charsPerLine = Math.max(8, Math.floor(contentWidth / charWidth));
  const raw = text.split("\n").reduce((n, line) => n + Math.max(1, Math.ceil(line.length / charsPerLine)), 0);
  return Math.min(BIO_LINE_CLAMP, raw);
}

function avatarFrameOverflow(avatarSize: number, hasFrame: boolean): number {
  if (!hasFrame) return 0;
  return Math.ceil(avatarSize * (AVATAR_FRAME_SCALE - 1) / 2);
}

function estimateDiscordInsideHeight(profile: Profile): number {
  if (!profile.discord_user_id || profile.discord_card_mode === "outside") return 0;
  const scale = Math.min(140, Math.max(80, Number(profile.discord_inside_scale ?? 100) || 100)) / 100;
  return Math.round(18 + 48 * scale + 28);
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

function estimateInsideBlocksHeight(
  blocks: ProfileBlock[] | undefined,
  layout: Profile["card_layout"],
): number {
  if (!blocks?.length) return 0;
  const inside = blocks.filter((b) => b.placement === "inside");
  if (!inside.length) return 0;

  const rows = inside.length;
  const wrapperLead = layout === "aligned" ? 0 : 12;
  let total = wrapperLead + 16;
  for (let i = 0; i < rows; i++) {
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
  return inner + 32;
}

function socialItemFootprint(profile: Profile, compact: boolean): number {
  const { iconPx, boxPx, logo } = getSocialIconDimensions(profile, compact);
  return logo ? iconPx : boxPx;
}

function estimateAlignedSocialHeight(profile: Profile, cardWidth: number): number {
  const count = countSocials(profile);
  if (!count) return 0;

  const itemPx = socialItemFootprint(profile, true);
  const titleExtra = profile.show_social_titles === true ? 14 : 0;
  const gap = getSocialIconGapPx(profile);
  const rowWidth = Math.max(80, cardWidth - 48);
  const itemsPerRow = Math.max(1, Math.floor((rowWidth + gap) / (itemPx + gap)));
  const rows = Math.ceil(count / itemsPerRow);
  const rowHeight = itemPx + titleExtra;
  const wrapGap = 4;

  return 8 + rows * rowHeight + Math.max(0, rows - 1) * wrapGap;
}

function estimateSocialRowsHeight(profile: Profile, cardWidth: number, compact = false): number {
  const count = countSocials(profile);
  if (!count) return 0;

  const itemPx = socialItemFootprint(profile, compact);
  const titleExtra = profile.show_social_titles === true ? 14 : 0;
  const gap = getSocialIconGapPx(profile);
  const rowWidth = Math.max(80, cardWidth - 48);
  const itemsPerRow = Math.max(1, Math.floor((rowWidth + gap) / (itemPx + gap)));
  const rows = Math.ceil(count / itemsPerRow);
  const rowHeight = itemPx + titleExtra;
  const wrapGap = 4;

  return 14 + rows * rowHeight + Math.max(0, rows - 1) * wrapGap;
}

function roundCardHeight(h: number): number {
  return Math.round(h / CARD_HEIGHT_STEP) * CARD_HEIGHT_STEP;
}

function estimateAlignedBody(profile: Profile, opts?: { blocks?: ProfileBlock[] }): number {
  const cardWidth = Number(profile.card_width) || 600;
  const avatarSize = Number(profile.avatar_size ?? 96);
  const frame = avatarFrameOverflow(avatarSize, Boolean(profile.avatar_frame_id));
  const avatarVisualH = avatarSize + frame * 2;
  const bio = profile.bio ?? "";
  const showUsername = profile.show_username !== false;
  const showBadges = profile.show_role_badges !== false;
  const badgeRowH = showBadges ? getRoleBadgeSizePx(profile) + 4 : 0;

  const textWidth = Math.max(120, cardWidth - 48 - avatarSize - 16);
  const bioLines = estimateTextLines(bio, textWidth, 7);

  let textCol = 26;
  if (showBadges) textCol += badgeRowH;
  if (showUsername) textCol += 18;
  textCol += (bio ? 8 : 0) + bioLines * 16;

  const avatarStack = avatarVisualH;
  const socialH = estimateAlignedSocialHeight(profile, cardWidth);
  let body = Math.max(avatarStack, textCol) + socialH + ALIGNED_PADDING_Y;
  body += estimateInsideBlocksHeight(opts?.blocks, "aligned");
  body += estimateFooterHeight(profile);
  return body;
}

function estimateCenteredBody(profile: Profile, opts?: { blocks?: ProfileBlock[] }): number {
  const cardWidth = Number(profile.card_width) || 600;
  const avatarSize = Number(profile.avatar_size ?? 96);
  const avatar = Math.max(52, Math.round(avatarSize * 1.1));
  const hasBanner = Boolean(profile.inner_banner_url);
  const bio = profile.bio ?? "";
  const showUsername = profile.show_username !== false;
  const showBadges = profile.show_role_badges !== false;
  const badgeRowH = showBadges ? getRoleBadgeSizePx(profile) + 4 : 0;

  const bioLines = estimateTextLines(bio, cardWidth - 48, 7.5);

  let body = (hasBanner ? 20 : 16) + avatar + 12;
  body += 26;
  if (showBadges) body += badgeRowH;
  if (showUsername) body += 18;
  body += (bio ? 8 : 0) + bioLines * 18;
  body += estimateSocialRowsHeight(profile, cardWidth);
  body += 16;
  body += estimateInsideBlocksHeight(opts?.blocks, "centered");
  body += estimateFooterHeight(profile);

  if (hasBanner) {
    let cardH = body;
    for (let i = 0; i < 10; i++) {
      const strip = Math.round(cardH * BANNER_VISIBLE_RATIO);
      const next = body + strip - BANNER_BEHIND_AVATAR_PX;
      if (next <= cardH) break;
      cardH = next;
    }
    return cardH;
  }

  return body;
}

function estimateDefaultBody(profile: Profile, opts?: { blocks?: ProfileBlock[] }): number {
  const cardWidth = Number(profile.card_width) || 600;
  const avatarSize = Number(profile.avatar_size ?? 96);
  const hasBanner = Boolean(profile.inner_banner_url);
  const bio = profile.bio ?? "";
  const showUsername = profile.show_username !== false;
  const showBadges = profile.show_role_badges !== false;
  const badgeRowH = showBadges ? getRoleBadgeSizePx(profile) + 4 : 0;

  const bioLines = estimateTextLines(bio, cardWidth - 48, 7.5);

  let body = (hasBanner ? 20 : 24) + 8 + avatarSize + 12;
  body += 24;
  if (showBadges) body += badgeRowH;
  if (showUsername) body += 18;
  body += (bio ? 8 : 0) + bioLines * 18;
  body += estimateSocialRowsHeight(profile, cardWidth);
  body += 16;
  body += estimateInsideBlocksHeight(opts?.blocks, "default");
  body += estimateFooterHeight(profile);

  if (hasBanner) {
    let cardH = body;
    for (let i = 0; i < 10; i++) {
      const strip = Math.round(cardH * BANNER_VISIBLE_RATIO);
      const next = body + strip - BANNER_BEHIND_AVATAR_PX;
      if (next <= cardH) break;
      cardH = next;
    }
    return cardH;
  }

  return body;
}

/**
 * Altura mínima do card para caber o conteúdo visível (sem scroll interno).
 * Alinhado com paddings e line-clamp do ProfileCard.
 */
export function estimateMinCardHeight(
  profile: Profile,
  opts?: { blocks?: ProfileBlock[] },
): number {
  const layout = profile.card_layout ?? "centered";

  let body =
    layout === "aligned"
      ? estimateAlignedBody(profile, opts)
      : layout === "centered"
        ? estimateCenteredBody(profile, opts)
        : estimateDefaultBody(profile, opts);

  return Math.min(
    CARD_HEIGHT_SLIDER_MAX,
    Math.max(CARD_HEIGHT_ABSOLUTE_MIN, roundCardHeight(body)),
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
