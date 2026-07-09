-- Fix: security trigger was undoing view_count / link_click_count bumps from trusted functions.

CREATE OR REPLACE FUNCTION public.protect_profiles_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;

  -- Trusted metric RPCs/triggers set this flag for the current transaction only.
  IF current_setting('byosy.profile_metrics_bump', true) = '1' THEN
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

CREATE OR REPLACE FUNCTION public.bump_profile_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('byosy.profile_metrics_bump', '1', true);
  UPDATE public.profiles
  SET view_count = view_count + 1
  WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_profile_view(target_profile_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count bigint;
BEGIN
  PERFORM set_config('byosy.profile_metrics_bump', '1', true);
  UPDATE public.profiles
  SET view_count = view_count + 1
  WHERE id = target_profile_id
  RETURNING view_count INTO new_count;

  RETURN COALESCE(new_count, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.bump_profile_link_click_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('byosy.profile_metrics_bump', '1', true);
  UPDATE public.profiles
  SET link_click_count = link_click_count + 1
  WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_profile_link_click(target_profile_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count bigint;
BEGIN
  PERFORM set_config('byosy.profile_metrics_bump', '1', true);
  UPDATE public.profiles
  SET link_click_count = link_click_count + 1
  WHERE id = target_profile_id
  RETURNING link_click_count INTO new_count;

  RETURN COALESCE(new_count, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.increment_profile_view(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_profile_view(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_profile_view(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.increment_profile_link_click(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_profile_link_click(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_profile_link_click(uuid) TO service_role;

GRANT SELECT, INSERT ON public.profile_view_dedup TO service_role;
GRANT SELECT, INSERT ON public.profile_link_click_dedup TO service_role;

NOTIFY pgrst, 'reload schema';
