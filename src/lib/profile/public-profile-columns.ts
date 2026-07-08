/**
 * Explicit allowlist of columns fetched for the public profile route.
 * Keep this list minimal and in sync with fields actually used on the public UI.
 */
export const PUBLIC_PROFILE_SELECT = [
  // Identity / display
  "id",
  "username",
  "display_name",
  "bio",
  "public_uid",
  "show_username",
  "show_public_uid",

  // Avatar
  "avatar_url",
  "avatar_pos_x",
  "avatar_pos_y",
  "avatar_border_color",
  "avatar_border_width",
  "avatar_size",
  "avatar_frame_id",

  // Premium / role badges (roles list fetched separately)
  "is_premium",
  "show_role_badges",
  "role_badges_monochrome",
  "role_badges_mono_color",
  "role_badges_size_px",
  "role_badges_gap",
  "role_badges_placement",
  "role_badges_bloom",
  "role_badges_bloom_color",

  // Banner / wallpaper
  "banner_url",
  "background_url",
  "background_pos_x",
  "background_pos_y",
  "background_color",
  "background_blur",
  "background_brightness",

  // Card layout / styling
  "card_color",
  "card_opacity",
  "card_blur",
  "card_border_color",
  "card_border_width",
  "card_border_radius",
  "card_border_style",
  "card_width",
  "card_height",
  "card_layout",
  "inner_banner_url",
  "inner_banner_pos_x",
  "inner_banner_pos_y",

  // Effects
  "effect_tilt",
  "effect_hover",
  "effect_glow",
  "effect_glow_color",
  "effect_glow_size",
  "effect_border_glow",
  "effect_tilt_strength",

  // Socials
  "socials",
  "social_original_colors",
  "social_icon_color",
  "social_icon_style",
  "social_icon_size",
  "social_icon_gap",
  "social_icon_bloom",
  "social_icon_bloom_color",
  "show_social_titles",

  // Discord
  "discord_user_id",
  "discord_card_mode",
  "discord_show_badges",
  "discord_inside_scale",

  // Hotel / Habbo / Habblet public fields
  "habbo_username",
  "habbo_domain",
  "habbo_figure",
  "habbo_motto",
  "habbo_level",
  "habblet_username",
  "habblet_figure",
  "habblet_motto",
  "habblet_achievement_points",
  "hotel_card_placement",
  "hotel_card_row",
  "hotel_card_shape",
  "hotel_card_size",

  // Views (publicly shown depending on toggles)
  "view_count",
  "show_view_count",

  // Tap-to-reveal
  "tap_to_reveal_enabled",
  "tap_reveal_blur",
  "tap_reveal_brightness",
  "tap_reveal_mode",
  "tap_reveal_text",
  "card_reveal_effect",

  // Text effects / fonts / colors
  "text_typing_effect",
  "text_typing_name_effect",
  "text_typing_bio_effect",
  "page_font_family",
  "name_font_family",
  "title_text_color",
  "body_text_color",
  "muted_text_color",
  "icon_color",
  "badge_bg_color",
  "badge_text_color",
  "inner_divider_color",
  "inner_divider_opacity",
  "text_glow_enabled",
  "text_glow_color",
  "text_glow_size",
  "text_glow_scope",
  "name_text_animation",
  "bio_text_animation",
  "name_particle_color",
  "bio_particle_color",

  // Music
  "music_url",
  "music_title",
  "music_start_sec",
  "music_end_sec",
  "music_card_enabled",
  "music_card_art_url",
  "music_card_title",
  "music_card_subtitle",
  "music_card_width_pct",

  // Comments
  "comments_enabled",

  // Page tab / share embed
  "page_title",
  "page_favicon_url",
  "page_title_typing_effect",
  "share_embed_title",
  "share_embed_description",
  "share_embed_image_url",
].join(", ");
