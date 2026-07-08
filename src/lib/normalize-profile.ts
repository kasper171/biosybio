import {
  DEFAULT_CARD_HEIGHT,
  DEFAULT_CARD_LAYOUT,
  DEFAULT_CARD_WIDTH,
  type Profile,
} from "@/lib/profile-storage";
import { normalizeCardBorderStyle } from "@/lib/card-border";
import { TEXT_GLOW_MAX_PX, normalizeTextGlowScope } from "@/lib/profile-colors";
import { normalizeTextAnimationId } from "@/lib/text-animations";
import { canUseAvatarFrame } from "@/lib/avatar-frames";

export function normalizeProfile(raw: Record<string, unknown>): Profile {
  const p = raw as Profile;
  const borderStyle = normalizeCardBorderStyle(p.card_border_style);
  return {
    ...p,
    card_border_style: borderStyle,
    card_border_width: Number(p.card_border_width) || 0,
    card_width: Number(p.card_width ?? DEFAULT_CARD_WIDTH) || DEFAULT_CARD_WIDTH,
    card_height: Number(p.card_height ?? DEFAULT_CARD_HEIGHT) || DEFAULT_CARD_HEIGHT,
    card_opacity: Number(p.card_opacity) ?? 0.7,
    effect_glow_size: Number(p.effect_glow_size) || 24,
    effect_glow_color: p.effect_glow_color ?? p.card_border_color ?? "#ff2d7a",
    effect_border_glow: p.effect_border_glow === true,
    effect_tilt_strength: Math.min(10, Math.max(1, Number(p.effect_tilt_strength ?? 5) || 5)),
    card_layout: (["default", "centered", "aligned"] as const).includes(p.card_layout as "default" | "centered" | "aligned")
      ? (p.card_layout as "default" | "centered" | "aligned")
      : DEFAULT_CARD_LAYOUT,
    social_icon_color: p.social_icon_color ?? "#ffffff",
    social_icon_style: (p.social_icon_style as "boxed" | "logo") === "logo" ? "logo" : "boxed",
    social_icon_size: Math.min(200, Math.max(60, Number(p.social_icon_size ?? 100) || 100)),
    social_icon_gap: Math.min(20, Math.max(0, Math.round(Number(p.social_icon_gap ?? 5) || 5))),
    social_icon_bloom: p.social_icon_bloom === true,
    social_icon_bloom_color: p.social_icon_bloom_color ?? null,
    show_social_titles: p.show_social_titles === true,
    avatar_border_color: (p.avatar_border_color as string) ?? p.card_border_color ?? "#ff2d7a",
    avatar_border_width: Number(p.avatar_border_width ?? 4),
    avatar_size: Number(p.avatar_size ?? 96),
    avatar_pos_x: Number(p.avatar_pos_x ?? 50),
    avatar_pos_y: Number(p.avatar_pos_y ?? 50),
    avatar_frame_id: (() => {
      const frameId = (p.avatar_frame_id as string | null) ?? null;
      const draft = {
        ...p,
        is_premium: p.is_premium === true,
        roles: (p.roles as Profile["roles"]) ?? [],
      } as Profile;
      return frameId && canUseAvatarFrame(frameId, draft) ? frameId : null;
    })(),
    is_premium: p.is_premium === true,
    roles: (p.roles as Profile["roles"]) ?? undefined,
    show_role_badges: p.show_role_badges !== false,
    role_badges_monochrome: p.role_badges_monochrome === true,
    role_badges_mono_color: (p.role_badges_mono_color as string) ?? "#ffffff",
    role_badges_size_px: (() => {
      const raw = Number(p.role_badges_size_px ?? 32);
      return Number.isFinite(raw) ? Math.min(44, Math.max(20, Math.round(raw))) : 32;
    })(),
    role_badges_bloom: p.role_badges_bloom === true,
    role_badges_bloom_color: (p.role_badges_bloom_color as string | null) ?? null,
    inner_banner_pos_x: Number(p.inner_banner_pos_x ?? 50),
    inner_banner_pos_y: Number(p.inner_banner_pos_y ?? 50),
    background_blur: Number(p.background_blur ?? 0),
    background_brightness: Number(p.background_brightness ?? 100),
    background_pos_x: Number(p.background_pos_x ?? 50),
    background_pos_y: Number(p.background_pos_y ?? 50),
    discord_user_id: (p.discord_user_id as string | null) ?? null,
    discord_card_mode: (p.discord_card_mode as "inside" | "outside") === "outside" ? "outside" : "inside",
    discord_show_badges: p.discord_show_badges !== false,
    discord_inside_scale: Math.min(140, Math.max(80, Number(p.discord_inside_scale ?? 100) || 100)),
    habbo_username: (p.habbo_username as string | null) ?? null,
    habbo_domain: (p.habbo_domain as string | null) ?? null,
    habbo_figure: (p.habbo_figure as string | null) ?? null,
    habbo_motto: (p.habbo_motto as string | null) ?? null,
    habbo_level: p.habbo_level == null ? null : Number(p.habbo_level),
    habblet_username: (p.habblet_username as string | null) ?? null,
    habblet_figure: (p.habblet_figure as string | null) ?? null,
    habblet_motto: (p.habblet_motto as string | null) ?? null,
    habblet_achievement_points:
      p.habblet_achievement_points == null ? null : Number(p.habblet_achievement_points),
    habbo_synced_at: (p.habbo_synced_at as string | null) ?? null,
    habblet_synced_at: (p.habblet_synced_at as string | null) ?? null,
    hotel_card_placement:
      (p.hotel_card_placement as "inside" | "outside") === "outside" ? "outside" : "inside",
    hotel_card_row:
      (p.hotel_card_row as "same_row" | "separate_row") === "same_row"
        ? "same_row"
        : "separate_row",
    hotel_card_shape: (p.hotel_card_shape as string) === "square" ? "square" : "rectangle",
    hotel_card_size:
      (p.hotel_card_size as string) === "sm" || (p.hotel_card_size as string) === "lg"
        ? (p.hotel_card_size as "sm" | "lg")
        : "md",
    hotel_platform:
      p.hotel_platform === "habbo" || p.hotel_platform === "habblet"
        ? p.hotel_platform
        : null,
    hotel_username: (p.hotel_username as string | null) ?? null,
    hotel_domain: (p.hotel_domain as string | null) ?? null,
    hotel_figure: (p.hotel_figure as string | null) ?? null,
    hotel_motto: (p.hotel_motto as string | null) ?? null,
    hotel_level: p.hotel_level == null ? null : Number(p.hotel_level),
    hotel_achievement_points:
      p.hotel_achievement_points == null ? null : Number(p.hotel_achievement_points),
    view_count: Number(p.view_count ?? 0),
    link_click_count: Number(p.link_click_count ?? 0),
    public_uid: p.public_uid == null ? null : Number(p.public_uid),
    show_view_count: p.show_view_count !== false,
    show_username: p.show_username !== false,
    show_public_uid: p.show_public_uid !== false,
    tap_to_reveal_enabled: p.music_url ? true : p.tap_to_reveal_enabled === true,
    tap_reveal_blur: Number(p.tap_reveal_blur ?? 20),
    tap_reveal_brightness: Number(p.tap_reveal_brightness ?? 55),
    tap_reveal_mode: (p.tap_reveal_mode as "avatar_text" | "text_only") === "text_only" ? "text_only" : "avatar_text",
    tap_reveal_text: (p.tap_reveal_text as string) ?? "Tap to reveal",
    card_reveal_effect:
      (p.card_reveal_effect as "fade" | "slide_up" | "scale") === "slide_up"
        ? "slide_up"
        : (p.card_reveal_effect as "fade" | "slide_up" | "scale") === "scale"
          ? "scale"
          : "fade",
    text_typing_effect: false,
    text_typing_name_effect: false,
    text_typing_bio_effect: false,
    music_url: (p.music_url as string | null) ?? null,
    music_title: (p.music_title as string | null) ?? null,
    music_start_sec: Number(p.music_start_sec ?? 0),
    music_end_sec: p.music_end_sec == null ? null : Number(p.music_end_sec),
    music_card_enabled: p.music_card_enabled !== false,
    music_card_art_url: (p.music_card_art_url as string | null) ?? null,
    music_card_title: (p.music_card_title as string | null) ?? null,
    music_card_subtitle: (p.music_card_subtitle as string | null) ?? null,
    music_card_width_pct: (() => {
      const pct = Number(p.music_card_width_pct ?? 100);
      return Number.isFinite(pct) ? Math.min(100, Math.max(40, Math.round(pct))) : 100;
    })(),
    comments_enabled: p.comments_enabled !== false,
    public_template_enabled: p.public_template_enabled === true,
    share_embed_title: (p.share_embed_title as string | null) ?? null,
    share_embed_description: (p.share_embed_description as string | null) ?? null,
    share_embed_image_url: (p.share_embed_image_url as string | null) ?? null,
    page_title: (p.page_title as string | null) ?? null,
    page_favicon_url: (p.page_favicon_url as string | null) ?? null,
    page_title_typing_effect: p.page_title_typing_effect === true,

    page_font_family:
      (p.page_font_family as string) ??
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif",
    name_font_family: (p.name_font_family as string) ?? "inherit",
    title_text_color: (p.title_text_color as string) ?? "#ffffff",
    body_text_color: (p.body_text_color as string) ?? "rgba(255,255,255,0.80)",
    muted_text_color: (p.muted_text_color as string) ?? "rgba(255,255,255,0.55)",
    icon_color: (p.icon_color as string) ?? "rgba(255,255,255,0.85)",
    badge_bg_color: (p.badge_bg_color as string) ?? "rgba(0,0,0,0.45)",
    badge_text_color: (p.badge_text_color as string) ?? "rgba(255,255,255,0.85)",
    inner_divider_color: (p.inner_divider_color as string) ?? "#ffffff",
    inner_divider_opacity: Math.min(1, Math.max(0, Number(p.inner_divider_opacity ?? 0.15))),
    text_glow_enabled: p.text_glow_enabled === true,
    text_glow_color:
      (p.text_glow_color as string) ??
      (p.effect_glow_color ?? p.card_border_color ?? "#ff2d7a"),
    text_glow_size: Math.min(TEXT_GLOW_MAX_PX, Math.max(0, Number(p.text_glow_size ?? 0))),
    text_glow_scope: normalizeTextGlowScope(p.text_glow_scope),
    name_text_animation: normalizeTextAnimationId(p.name_text_animation),
    bio_text_animation: normalizeTextAnimationId(p.bio_text_animation),
    name_particle_color: (p.name_particle_color as string) ?? "#ff2d7a",
    bio_particle_color: (p.bio_particle_color as string) ?? "#ff2d7a",
  };
}
