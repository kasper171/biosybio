-- Biosy — patch idempotente (recursos recentes)
-- Rode no Supabase: SQL Editor → New query → colar e executar.
-- Corrige: badge_bg_color, colors, templates, card_layout, etc.

-- =========================
-- Colunas em profiles
-- =========================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS discord_inside_scale integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS effect_border_glow boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS effect_tilt_strength integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS card_layout text NOT NULL DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS public_template_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS page_font_family text NOT NULL
    DEFAULT 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif',
  ADD COLUMN IF NOT EXISTS name_font_family text NOT NULL DEFAULT 'inherit',
  ADD COLUMN IF NOT EXISTS title_text_color text NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS body_text_color text NOT NULL DEFAULT 'rgba(255,255,255,0.80)',
  ADD COLUMN IF NOT EXISTS muted_text_color text NOT NULL DEFAULT 'rgba(255,255,255,0.55)',
  ADD COLUMN IF NOT EXISTS icon_color text NOT NULL DEFAULT 'rgba(255,255,255,0.85)',
  ADD COLUMN IF NOT EXISTS badge_bg_color text NOT NULL DEFAULT 'rgba(0,0,0,0.45)',
  ADD COLUMN IF NOT EXISTS badge_text_color text NOT NULL DEFAULT 'rgba(255,255,255,0.85)',
  ADD COLUMN IF NOT EXISTS inner_divider_color text NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS inner_divider_opacity real NOT NULL DEFAULT 0.15,
  ADD COLUMN IF NOT EXISTS text_glow_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS text_glow_color text NOT NULL DEFAULT '#ff2d7a',
  ADD COLUMN IF NOT EXISTS text_glow_size integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS name_text_animation text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS bio_text_animation text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS text_glow_scope text NOT NULL DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS name_particle_color text NOT NULL DEFAULT '#ff2d7a',
  ADD COLUMN IF NOT EXISTS bio_particle_color text NOT NULL DEFAULT '#ff2d7a';

-- Remove efeito Textured Mask (descontinuado)
UPDATE public.profiles SET name_text_animation = 'none' WHERE name_text_animation = 'textured_mask';
UPDATE public.profiles SET bio_text_animation = 'none' WHERE bio_text_animation = 'textured_mask';

-- CHECK card_layout (só se ainda não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_card_layout_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_card_layout_check
      CHECK (card_layout IN ('default', 'centered', 'aligned'));
  END IF;
END $$;

-- CHECK text_glow_scope
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_text_glow_scope_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_text_glow_scope_check
      CHECK (text_glow_scope IN ('display_name', 'titles', 'all'));
  END IF;
END $$;

-- CHECK animações de texto (sem textured_mask)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_name_text_animation_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_bio_text_animation_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_name_text_animation_check
  CHECK (name_text_animation IN (
    'none', 'slide_in', 'scale_in', 'bouncy', 'blur_in', 'wavy',
    'staggered_pop_in', 'shiny', 'gradient', 'glitch',
    'morphing', 'typewriter', 'particle'
  ));

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_bio_text_animation_check
  CHECK (bio_text_animation IN (
    'none', 'slide_in', 'scale_in', 'bouncy', 'blur_in', 'wavy',
    'staggered_pop_in', 'shiny', 'gradient', 'glitch',
    'morphing', 'typewriter', 'particle'
  ));

-- =========================
-- Templates (se ainda não existir)
-- =========================
CREATE TABLE IF NOT EXISTS public.profile_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  is_live boolean NOT NULL DEFAULT false,
  theme jsonb NOT NULL DEFAULT '{}'::jsonb,
  use_count integer NOT NULL DEFAULT 0,
  favorite_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profile_templates_name_len CHECK (char_length(name) BETWEEN 1 AND 80)
);

CREATE UNIQUE INDEX IF NOT EXISTS profile_templates_one_live_per_user_idx
  ON public.profile_templates(user_id) WHERE is_live = true;

CREATE INDEX IF NOT EXISTS profile_templates_public_list_idx
  ON public.profile_templates(visibility, updated_at DESC)
  WHERE visibility = 'public';

CREATE TABLE IF NOT EXISTS public.template_favorites (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.profile_templates(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, template_id)
);

CREATE TABLE IF NOT EXISTS public.template_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.profile_templates(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS template_usages_template_id_idx
  ON public.template_usages(template_id);

-- Triggers / RPC templates (idempotente)
CREATE OR REPLACE FUNCTION public.update_template_favorite_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profile_templates SET favorite_count = favorite_count + 1 WHERE id = NEW.template_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profile_templates SET favorite_count = GREATEST(0, favorite_count - 1) WHERE id = OLD.template_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS template_favorites_count_trigger ON public.template_favorites;
CREATE TRIGGER template_favorites_count_trigger
  AFTER INSERT OR DELETE ON public.template_favorites
  FOR EACH ROW EXECUTE FUNCTION public.update_template_favorite_count();

CREATE OR REPLACE FUNCTION public.set_template_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profile_templates_updated_at ON public.profile_templates;
CREATE TRIGGER profile_templates_updated_at
  BEFORE UPDATE ON public.profile_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_template_updated_at();

CREATE OR REPLACE FUNCTION public.record_template_usage(target_template_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  INSERT INTO public.template_usages (user_id, template_id) VALUES (auth.uid(), target_template_id);
  UPDATE public.profile_templates SET use_count = use_count + 1 WHERE id = target_template_id;
END;
$$;

ALTER TABLE public.profile_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_usages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public templates readable by everyone" ON public.profile_templates;
CREATE POLICY "Public templates readable by everyone"
  ON public.profile_templates FOR SELECT TO anon, authenticated
  USING (visibility = 'public' OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own templates" ON public.profile_templates;
CREATE POLICY "Users can insert own templates"
  ON public.profile_templates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own templates" ON public.profile_templates;
CREATE POLICY "Users can update own templates"
  ON public.profile_templates FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own templates" ON public.profile_templates;
CREATE POLICY "Users can delete own templates"
  ON public.profile_templates FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own favorites" ON public.template_favorites;
CREATE POLICY "Users can read own favorites"
  ON public.template_favorites FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can favorite" ON public.template_favorites;
CREATE POLICY "Users can favorite"
  ON public.template_favorites FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unfavorite" ON public.template_favorites;
CREATE POLICY "Users can unfavorite"
  ON public.template_favorites FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can record usage" ON public.template_usages;
CREATE POLICY "Users can record usage"
  ON public.template_usages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT ON public.profile_templates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profile_templates TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.template_favorites TO authenticated;
GRANT INSERT ON public.template_usages TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_template_usage(uuid) TO authenticated;

-- Cliques em links sociais + stats da home
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS link_click_count bigint NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.profile_link_click_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  social_key text,
  clicked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profile_link_click_events_profile_id_idx
  ON public.profile_link_click_events (profile_id);

ALTER TABLE public.profile_link_click_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can log profile link clicks" ON public.profile_link_click_events;
CREATE POLICY "Public can log profile link clicks"
  ON public.profile_link_click_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Owner can read own link click events" ON public.profile_link_click_events;
CREATE POLICY "Owner can read own link click events"
  ON public.profile_link_click_events FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

GRANT SELECT ON public.profile_link_click_events TO authenticated;
GRANT INSERT ON public.profile_link_click_events TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_profile_link_click(target_profile_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count bigint;
BEGIN
  UPDATE public.profiles
  SET link_click_count = link_click_count + 1
  WHERE id = target_profile_id
  RETURNING link_click_count INTO new_count;

  RETURN COALESCE(new_count, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.increment_profile_link_click(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_profile_link_click(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.bump_profile_link_click_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET link_click_count = link_click_count + 1
  WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_link_click_insert ON public.profile_link_click_events;
CREATE TRIGGER on_profile_link_click_insert
  AFTER INSERT ON public.profile_link_click_events
  FOR EACH ROW EXECUTE FUNCTION public.bump_profile_link_click_count();

REVOKE ALL ON FUNCTION public.bump_profile_link_click_count() FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'profile_count', (SELECT count(*)::bigint FROM public.profiles),
    'total_views', (SELECT COALESCE(sum(view_count), 0)::bigint FROM public.profiles),
    'total_clicks', (SELECT COALESCE(sum(link_click_count), 0)::bigint FROM public.profiles)
  );
$$;

REVOKE ALL ON FUNCTION public.get_platform_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_platform_stats() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_featured_creators(limit_count integer DEFAULT 24)
RETURNS TABLE (
  username text,
  display_name text,
  avatar_url text,
  view_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.username,
    p.display_name,
    p.avatar_url,
    p.view_count
  FROM public.profiles p
  WHERE p.avatar_url IS NOT NULL
    AND btrim(p.avatar_url) <> ''
  ORDER BY p.view_count DESC, p.created_at DESC NULLS LAST
  LIMIT GREATEST(limit_count, 1);
$$;

REVOKE ALL ON FUNCTION public.get_featured_creators(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_featured_creators(integer) TO anon, authenticated;

-- Novos usuários: template público ativo por padrão
ALTER TABLE public.profiles
  ALTER COLUMN public_template_enabled SET DEFAULT true;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username text;
  final_username text;
  suffix int := 0;
BEGIN
  base_username := lower(regexp_replace(
    COALESCE(NEW.raw_user_meta_data->>'username',
             split_part(NEW.email, '@', 1),
             'user'),
    '[^a-z0-9_]', '', 'g'
  ));
  IF length(base_username) < 3 THEN
    base_username := 'user' || substr(NEW.id::text, 1, 6);
  END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  END LOOP;

  INSERT INTO public.profiles (id, username, display_name, avatar_url, public_template_enabled)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name',
             NEW.raw_user_meta_data->>'full_name',
             final_username),
    NEW.raw_user_meta_data->>'avatar_url',
    true
  );
  RETURN NEW;
END;
$$;

-- Blocos personalizáveis no perfil
CREATE TABLE IF NOT EXISTS public.profile_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  block_type text NOT NULL CHECK (block_type IN ('link', 'button', 'spotify', 'youtube', 'text', 'discord_invite')),
  placement text NOT NULL DEFAULT 'inside' CHECK (placement IN ('inside', 'outside')),
  sort_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  image_url text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profile_blocks_profile_order_idx
  ON public.profile_blocks(profile_id, placement, sort_order);

ALTER TABLE public.profile_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profile blocks are viewable by everyone" ON public.profile_blocks;
CREATE POLICY "Profile blocks are viewable by everyone"
  ON public.profile_blocks FOR SELECT
  USING (enabled = true OR auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can insert their own profile blocks" ON public.profile_blocks;
CREATE POLICY "Users can insert their own profile blocks"
  ON public.profile_blocks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can update their own profile blocks" ON public.profile_blocks;
CREATE POLICY "Users can update their own profile blocks"
  ON public.profile_blocks FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can delete their own profile blocks" ON public.profile_blocks;
CREATE POLICY "Users can delete their own profile blocks"
  ON public.profile_blocks FOR DELETE
  TO authenticated
  USING (auth.uid() = profile_id);

GRANT SELECT ON public.profile_blocks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profile_blocks TO authenticated;
GRANT ALL ON public.profile_blocks TO service_role;

CREATE OR REPLACE FUNCTION public.set_profile_block_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profile_blocks_updated_at ON public.profile_blocks;
CREATE TRIGGER profile_blocks_updated_at
  BEFORE UPDATE ON public.profile_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_profile_block_updated_at();

ALTER TABLE public.profile_blocks
  DROP CONSTRAINT IF EXISTS profile_blocks_block_type_check;

ALTER TABLE public.profile_blocks
  ADD CONSTRAINT profile_blocks_block_type_check
  CHECK (block_type IN ('link', 'button', 'spotify', 'youtube', 'discord_invite', 'text'));

NOTIFY pgrst, 'reload schema';
