-- Fix: trigger de segurança impedia sync_profile_premium_from_roles de setar is_premium.

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

  -- sync_profile_premium_from_roles (cargo premium/staff/etc.)
  IF current_setting('byosy.profile_premium_sync', true) = '1' THEN
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

CREATE OR REPLACE FUNCTION public.sync_profile_premium_from_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id uuid;
BEGIN
  target_id := COALESCE(NEW.profile_id, OLD.profile_id);
  PERFORM set_config('byosy.profile_premium_sync', '1', true);
  UPDATE public.profiles p
  SET is_premium = public.profile_has_full_access(target_id)
  WHERE p.id = target_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Corrige perfis que já tinham cargo premium mas is_premium ficou false.
SELECT set_config('byosy.profile_premium_sync', '1', true);

UPDATE public.profiles p
SET is_premium = public.profile_has_full_access(p.id)
WHERE p.is_premium IS DISTINCT FROM public.profile_has_full_access(p.id);

NOTIFY pgrst, 'reload schema';
