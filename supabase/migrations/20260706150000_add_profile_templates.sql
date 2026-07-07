ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS public_template_enabled boolean NOT NULL DEFAULT false;

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

CREATE OR REPLACE FUNCTION public.update_template_favorite_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profile_templates
    SET favorite_count = favorite_count + 1
    WHERE id = NEW.template_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profile_templates
    SET favorite_count = GREATEST(0, favorite_count - 1)
    WHERE id = OLD.template_id;
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
  INSERT INTO public.template_usages (user_id, template_id)
  VALUES (auth.uid(), target_template_id);
  UPDATE public.profile_templates
  SET use_count = use_count + 1
  WHERE id = target_template_id;
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
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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

NOTIFY pgrst, 'reload schema';
