-- Overlays estáticos: cor + espaçamento; tipos diagonal-stripes, cyber-grid, dot-pattern
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS overlay_color text NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS overlay_spacing integer NOT NULL DEFAULT 10;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_overlay_spacing_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_overlay_spacing_check
  CHECK (overlay_spacing >= 4 AND overlay_spacing <= 48);

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_overlay_color_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_overlay_color_check
  CHECK (overlay_color ~ '^#[0-9a-fA-F]{6}$');

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_overlay_type_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_overlay_type_check
  CHECK (
    overlay_type IS NULL
    OR overlay_type IN (
      'noise-denso',
      'noise-esparso',
      'scanlines',
      'film-grain',
      'diagonal-stripes',
      'cyber-grid',
      'dot-pattern'
    )
  );

COMMENT ON COLUMN public.profiles.overlay_color IS
  'Cor da textura para overlays estáticos (hex #RRGGBB)';
COMMENT ON COLUMN public.profiles.overlay_spacing IS
  'Espaçamento/densidade do padrão estático (4–48 px)';

DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public
WITH (security_barrier = true) AS
SELECT
  id,
  username,
  display_name,
  bio,
  public_uid,
  show_username,
  show_public_uid,
  avatar_url,
  avatar_pos_x,
  avatar_pos_y,
  avatar_border_color,
  avatar_border_width,
  avatar_size,
  avatar_frame_id,
  is_premium,
  show_role_badges,
  role_badges_monochrome,
  role_badges_mono_color,
  role_badges_size_px,
  role_badges_gap,
  role_badges_placement,
  role_badges_bloom,
  role_badges_bloom_color,
  role_badges_hidden,
  profile_labels,
  banner_url,
  background_url,
  background_pos_x,
  background_pos_y,
  background_color,
  background_blur,
  background_brightness,
  card_color,
  card_opacity,
  card_blur,
  card_border_color,
  card_border_width,
  card_border_radius,
  card_border_style,
  card_width,
  card_height,
  card_layout,
  inner_banner_url,
  inner_banner_pos_x,
  inner_banner_pos_y,
  effect_tilt,
  effect_hover,
  effect_glow,
  effect_glow_color,
  effect_glow_size,
  effect_border_glow,
  effect_tilt_strength,
  socials,
  social_original_colors,
  social_icon_color,
  social_icon_style,
  social_icon_size,
  social_icon_gap,
  social_icon_bloom,
  social_icon_bloom_color,
  show_social_titles,
  discord_user_id,
  discord_card_mode,
  discord_show_badges,
  discord_inside_scale,
  habbo_username,
  habbo_domain,
  habbo_figure,
  habbo_motto,
  habbo_level,
  habblet_username,
  habblet_figure,
  habblet_motto,
  habblet_achievement_points,
  hotel_card_placement,
  hotel_card_row,
  hotel_card_shape,
  hotel_card_size,
  view_count,
  show_view_count,
  tap_to_reveal_enabled,
  tap_reveal_blur,
  tap_reveal_brightness,
  tap_reveal_mode,
  tap_reveal_text,
  card_reveal_effect,
  text_typing_effect,
  text_typing_name_effect,
  text_typing_bio_effect,
  page_font_family,
  name_font_family,
  title_text_color,
  body_text_color,
  muted_text_color,
  icon_color,
  badge_bg_color,
  badge_text_color,
  inner_divider_color,
  inner_divider_opacity,
  text_glow_enabled,
  text_glow_color,
  text_glow_size,
  text_glow_scope,
  name_text_animation,
  bio_text_animation,
  name_particle_color,
  bio_particle_color,
  overlay_type,
  overlay_opacity,
  overlay_color,
  overlay_spacing,
  music_url,
  music_title,
  music_start_sec,
  music_end_sec,
  music_card_enabled,
  music_card_art_url,
  music_card_title,
  music_card_subtitle,
  music_card_width_pct,
  comments_enabled,
  public_template_enabled,
  page_title,
  page_favicon_url,
  page_title_typing_effect,
  share_embed_title,
  share_embed_description,
  share_embed_image_url,
  accent_color
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;
ALTER VIEW public.profiles_public SET (security_invoker = false);

NOTIFY pgrst, 'reload schema';
