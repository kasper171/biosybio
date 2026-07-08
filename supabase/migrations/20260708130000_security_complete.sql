-- =============================================================================
-- Security complete: public view, rate limits, audit log, event lockdown, storage
-- =============================================================================

-- ── Public profile view (no internal/sync/metric columns) ─────────────────────
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT
  id,
  username,
  display_name,
  bio,
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
  socials,
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
  hotel_platform,
  hotel_username,
  hotel_domain,
  hotel_figure,
  hotel_motto,
  hotel_level,
  hotel_achievement_points,
  hotel_card_placement,
  hotel_card_row,
  hotel_card_shape,
  hotel_card_size,
  view_count,
  show_view_count,
  show_username,
  public_uid,
  show_public_uid,
  tap_to_reveal_enabled,
  tap_reveal_blur,
  tap_reveal_brightness,
  tap_reveal_mode,
  tap_reveal_text,
  card_reveal_effect,
  text_typing_effect,
  text_typing_name_effect,
  text_typing_bio_effect,
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
  share_embed_title,
  share_embed_description,
  share_embed_image_url,
  blocks,
  accent_color
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;

REVOKE SELECT ON public.profiles FROM anon;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- ── Username availability without exposing profiles table ─────────────────────
CREATE OR REPLACE FUNCTION public.is_username_taken(p_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE username = lower(trim(p_username))
  );
$$;

REVOKE ALL ON FUNCTION public.is_username_taken(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_username_taken(text) TO anon, authenticated;

-- ── Rate limiting (server-side via service_role) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  bucket_key text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  hit_count integer NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_bucket text,
  p_max_hits integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_window interval := make_interval(secs => GREATEST(p_window_seconds, 1));
  v_count integer;
BEGIN
  INSERT INTO public.rate_limit_buckets (bucket_key, window_start, hit_count)
  VALUES (left(p_bucket, 200), v_now, 1)
  ON CONFLICT (bucket_key) DO UPDATE SET
    hit_count = CASE
      WHEN rate_limit_buckets.window_start + v_window <= v_now THEN 1
      ELSE rate_limit_buckets.hit_count + 1
    END,
    window_start = CASE
      WHEN rate_limit_buckets.window_start + v_window <= v_now THEN v_now
      ELSE rate_limit_buckets.window_start
    END
  RETURNING hit_count INTO v_count;

  RETURN v_count <= p_max_hits;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer) TO service_role;

-- ── Audit log ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id uuid,
  action text NOT NULL,
  target_type text,
  target_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  client_ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_created_at_idx
  ON public.audit_log (created_at DESC);

CREATE INDEX IF NOT EXISTS audit_log_action_idx
  ON public.audit_log (action, created_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.audit_log TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.audit_log_id_seq TO service_role;

CREATE OR REPLACE FUNCTION public.audit_profile_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (actor_id, action, target_type, target_id, metadata)
    VALUES (
      auth.uid(),
      'role_granted',
      'profile',
      NEW.profile_id::text,
      jsonb_build_object('role_id', NEW.role_id, 'notes', NEW.notes)
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (actor_id, action, target_type, target_id, metadata)
    VALUES (
      auth.uid(),
      'role_revoked',
      'profile',
      OLD.profile_id::text,
      jsonb_build_object('role_id', OLD.role_id)
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_profile_role_change ON public.profile_roles;
CREATE TRIGGER trg_audit_profile_role_change
  AFTER INSERT OR DELETE ON public.profile_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_role_change();

-- ── Visitor dedup for views/clicks ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profile_view_dedup (
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  counted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, visitor_id)
);

CREATE TABLE IF NOT EXISTS public.profile_link_click_dedup (
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  social_key text NOT NULL,
  clicked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, visitor_id, social_key)
);

ALTER TABLE public.profile_view_events
  ADD COLUMN IF NOT EXISTS visitor_id text;

ALTER TABLE public.profile_link_click_events
  ADD COLUMN IF NOT EXISTS visitor_id text;

REVOKE INSERT ON public.profile_view_events FROM anon, authenticated;
REVOKE INSERT ON public.profile_link_click_events FROM anon, authenticated;
GRANT INSERT ON public.profile_view_events TO service_role;
GRANT INSERT ON public.profile_link_click_events TO service_role;

-- ── Storage: restrict file extensions on upload ───────────────────────────────
DROP POLICY IF EXISTS "Users upload their own assets" ON storage.objects;
CREATE POLICY "Users upload their own assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND lower(storage.extension(name)) IN (
      'png', 'jpg', 'jpeg', 'webp', 'gif', 'mp3', 'wav', 'ogg', 'webm'
    )
  );

DROP POLICY IF EXISTS "Users update their own assets" ON storage.objects;
CREATE POLICY "Users update their own assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'profile-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND lower(storage.extension(name)) IN (
      'png', 'jpg', 'jpeg', 'webp', 'gif', 'mp3', 'wav', 'ogg', 'webm'
    )
  );
