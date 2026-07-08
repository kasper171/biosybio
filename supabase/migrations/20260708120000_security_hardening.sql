-- =============================================================================
-- Security hardening: privileged column protection, role grants, RPC access
-- =============================================================================

-- Helper: detect Supabase service_role JWT (backend-only operations).
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'service_role',
    false
  );
$$;

-- Block client-side mass assignment on privileged profile columns.
CREATE OR REPLACE FUNCTION public.protect_profiles_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.is_premium := OLD.is_premium;
    NEW.view_count := OLD.view_count;
    NEW.link_click_count := OLD.link_click_count;
    NEW.public_uid := OLD.public_uid;
    NEW.discord_user_id := OLD.discord_user_id;
    NEW.habbo_username := OLD.habbo_username;
    NEW.habbo_domain := OLD.habbo_domain;
    NEW.habbo_figure := OLD.habbo_figure;
    NEW.habbo_motto := OLD.habbo_motto;
    NEW.habbo_level := OLD.habbo_level;
    NEW.habbo_synced_at := OLD.habbo_synced_at;
    NEW.habblet_username := OLD.habblet_username;
    NEW.habblet_figure := OLD.habblet_figure;
    NEW.habblet_motto := OLD.habblet_motto;
    NEW.habblet_achievement_points := OLD.habblet_achievement_points;
    NEW.habblet_synced_at := OLD.habblet_synced_at;
    NEW.hotel_platform := OLD.hotel_platform;
    NEW.hotel_username := OLD.hotel_username;
    NEW.hotel_domain := OLD.hotel_domain;
    NEW.hotel_figure := OLD.hotel_figure;
    NEW.hotel_motto := OLD.hotel_motto;
    NEW.hotel_level := OLD.hotel_level;
    NEW.hotel_achievement_points := OLD.hotel_achievement_points;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profiles_privileged_columns ON public.profiles;
CREATE TRIGGER trg_protect_profiles_privileged_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profiles_privileged_columns();

-- Enforce comment author identity from server-side profile data.
CREATE OR REPLACE FUNCTION public.enforce_comment_author_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_row RECORD;
BEGIN
  IF NEW.author_id IS NULL THEN
    RAISE EXCEPTION 'author_id is required';
  END IF;

  IF NOT public.is_service_role() AND NEW.author_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Cannot impersonate another author';
  END IF;

  SELECT display_name, username, avatar_url
  INTO profile_row
  FROM public.profiles
  WHERE id = NEW.author_id;

  NEW.author_name := COALESCE(
    NULLIF(TRIM(profile_row.display_name), ''),
    NULLIF(TRIM(profile_row.username), ''),
    'User'
  );
  NEW.author_avatar_url := profile_row.avatar_url;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_comment_author_identity ON public.profile_comments;
CREATE TRIGGER trg_enforce_comment_author_identity
  BEFORE INSERT OR UPDATE OF author_id, author_name, author_avatar_url ON public.profile_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_comment_author_identity();

-- Prevent template metric inflation via direct UPDATE.
CREATE OR REPLACE FUNCTION public.protect_template_metrics()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.use_count := OLD.use_count;
    NEW.favorite_count := OLD.favorite_count;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_template_metrics ON public.profile_templates;
CREATE TRIGGER trg_protect_template_metrics
  BEFORE UPDATE ON public.profile_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_template_metrics();

-- Staff role grants: staff_dev may grant any role; staff only non-privileged roles.
DROP POLICY IF EXISTS "Staff can insert roles" ON public.profile_roles;
CREATE POLICY "Staff can insert roles"
  ON public.profile_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id = auth.uid()
        AND pr.role_id = 'staff_dev'
    )
    OR (
      EXISTS (
        SELECT 1 FROM public.profile_roles pr
        WHERE pr.profile_id = auth.uid()
          AND pr.role_id = 'staff'
      )
      AND role_id IN ('premium', 'donator', 'gifter')
    )
  );

DROP POLICY IF EXISTS "Staff can update roles" ON public.profile_roles;
CREATE POLICY "Staff can update roles"
  ON public.profile_roles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id = auth.uid()
        AND pr.role_id = 'staff_dev'
    )
    OR (
      EXISTS (
        SELECT 1 FROM public.profile_roles pr
        WHERE pr.profile_id = auth.uid()
          AND pr.role_id = 'staff'
      )
      AND role_id IN ('premium', 'donator', 'gifter')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id = auth.uid()
        AND pr.role_id = 'staff_dev'
    )
    OR (
      EXISTS (
        SELECT 1 FROM public.profile_roles pr
        WHERE pr.profile_id = auth.uid()
          AND pr.role_id = 'staff'
      )
      AND role_id IN ('premium', 'donator', 'gifter')
    )
  );

DROP POLICY IF EXISTS "Staff can delete roles" ON public.profile_roles;
CREATE POLICY "Staff can delete roles"
  ON public.profile_roles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id = auth.uid()
        AND pr.role_id = 'staff_dev'
    )
    OR (
      EXISTS (
        SELECT 1 FROM public.profile_roles pr
        WHERE pr.profile_id = auth.uid()
          AND pr.role_id = 'staff'
      )
      AND role_id IN ('premium', 'donator', 'gifter')
    )
  );

-- Metrics RPCs: service_role only (server functions use admin client).
REVOKE ALL ON FUNCTION public.increment_profile_view(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_profile_view(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_profile_view(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.increment_profile_link_click(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_profile_link_click(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_profile_link_click(uuid) TO service_role;
