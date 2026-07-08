-- Biosy: setup completo para projeto Supabase novo
-- Cole no SQL Editor do Supabase e execute (Run)

-- 1) Bucket de imagens (Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-assets', 'profile-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2) Tabela profiles + RLS + triggers
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  avatar_url text,
  banner_url text,
  background_url text,
  background_color text NOT NULL DEFAULT '#0a0510',
  card_color text NOT NULL DEFAULT '#1a0a18',
  card_opacity numeric NOT NULL DEFAULT 0.7,
  card_blur integer NOT NULL DEFAULT 12,
  card_border_color text NOT NULL DEFAULT '#ff2d7a',
  card_border_width numeric NOT NULL DEFAULT 1,
  card_border_radius integer NOT NULL DEFAULT 16,
  accent_color text NOT NULL DEFAULT '#ff2d7a',
  socials jsonb NOT NULL DEFAULT '{}'::jsonb,
  public_template_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_]{2,30}$')
);

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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
  IF length(base_username) < 2 THEN
    base_username := 'user' || substr(NEW.id::text, 1, 6);
  END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  END LOOP;

  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    public_template_enabled,
    card_layout,
    card_width,
    card_height
  )
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name',
             NEW.raw_user_meta_data->>'full_name',
             final_username),
    NEW.raw_user_meta_data->>'avatar_url',
    true,
    'centered',
    600,
    400
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 3) Colunas extras
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS card_width integer NOT NULL DEFAULT 600,
  ADD COLUMN IF NOT EXISTS card_height integer NOT NULL DEFAULT 400,
  ADD COLUMN IF NOT EXISTS card_layout text NOT NULL DEFAULT 'centered'
    CHECK (card_layout IN ('default', 'centered', 'aligned')),
  ADD COLUMN IF NOT EXISTS inner_banner_url text,
  ADD COLUMN IF NOT EXISTS effect_tilt boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS effect_hover boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS effect_glow boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS social_original_colors boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS card_border_style text NOT NULL DEFAULT 'solid',
  ADD COLUMN IF NOT EXISTS effect_glow_color text NOT NULL DEFAULT '#ff2d7a',
  ADD COLUMN IF NOT EXISTS effect_glow_size integer NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS social_icon_color text NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS social_icon_style text NOT NULL DEFAULT 'boxed',
  ADD COLUMN IF NOT EXISTS social_icon_size integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS social_icon_bloom boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS avatar_border_color text NOT NULL DEFAULT '#ff2d7a',
  ADD COLUMN IF NOT EXISTS avatar_border_width numeric NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS avatar_size numeric NOT NULL DEFAULT 96,
  ADD COLUMN IF NOT EXISTS discord_user_id text,
  ADD COLUMN IF NOT EXISTS discord_card_mode text NOT NULL DEFAULT 'inside',
  ADD COLUMN IF NOT EXISTS discord_show_badges boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS discord_inside_scale integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS inner_banner_pos_x numeric NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS inner_banner_pos_y numeric NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS background_blur integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS background_brightness integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS view_count bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS show_view_count boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_username boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_public_uid boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS tap_to_reveal_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tap_reveal_blur integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS tap_reveal_brightness integer NOT NULL DEFAULT 55,
  ADD COLUMN IF NOT EXISTS tap_reveal_mode text NOT NULL DEFAULT 'avatar_text',
  ADD COLUMN IF NOT EXISTS tap_reveal_text text NOT NULL DEFAULT 'Toque para revelar',
  ADD COLUMN IF NOT EXISTS card_reveal_effect text NOT NULL DEFAULT 'fade',
  ADD COLUMN IF NOT EXISTS text_typing_effect boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS text_typing_name_effect boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS text_typing_bio_effect boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS music_url text,
  ADD COLUMN IF NOT EXISTS music_title text,
  ADD COLUMN IF NOT EXISTS music_start_sec numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS music_end_sec numeric,
  ADD COLUMN IF NOT EXISTS comments_enabled boolean NOT NULL DEFAULT true;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS public_uid integer;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_public_uid_key
  ON public.profiles (public_uid)
  WHERE public_uid IS NOT NULL;

CREATE SEQUENCE IF NOT EXISTS public.profile_public_uid_seq START 1000;

-- Preenche perfis antigos sem UID
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) + 999 AS new_uid
  FROM public.profiles
  WHERE public_uid IS NULL
)
UPDATE public.profiles p
SET public_uid = n.new_uid
FROM numbered n
WHERE p.id = n.id;

SELECT setval(
  'public.profile_public_uid_seq',
  GREATEST(999, COALESCE((SELECT MAX(public_uid) FROM public.profiles), 999))
);

CREATE OR REPLACE FUNCTION public.assign_profile_public_uid()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.public_uid IS NULL THEN
    NEW.public_uid := nextval('public.profile_public_uid_seq');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS before_profile_insert_public_uid ON public.profiles;
CREATE TRIGGER before_profile_insert_public_uid
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_profile_public_uid();

CREATE OR REPLACE FUNCTION public.increment_profile_view(target_profile_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count bigint;
BEGIN
  UPDATE public.profiles
  SET view_count = view_count + 1
  WHERE id = target_profile_id
  RETURNING view_count INTO new_count;

  RETURN COALESCE(new_count, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.increment_profile_view(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_profile_view(uuid) TO anon, authenticated;

-- 5) Eventos de visualização (método principal — insert anon + trigger)
CREATE TABLE IF NOT EXISTS public.profile_view_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profile_view_events_profile_id_idx
  ON public.profile_view_events (profile_id);

ALTER TABLE public.profile_view_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can log profile views" ON public.profile_view_events;
CREATE POLICY "Public can log profile views"
  ON public.profile_view_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Owner can read own view events" ON public.profile_view_events;
CREATE POLICY "Owner can read own view events"
  ON public.profile_view_events FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

GRANT SELECT ON public.profile_view_events TO authenticated;

CREATE OR REPLACE FUNCTION public.bump_profile_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET view_count = view_count + 1
  WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_view_insert ON public.profile_view_events;
CREATE TRIGGER on_profile_view_insert
  AFTER INSERT ON public.profile_view_events
  FOR EACH ROW EXECUTE FUNCTION public.bump_profile_view_count();

REVOKE ALL ON FUNCTION public.bump_profile_view_count() FROM PUBLIC;

-- 6) Comentários de perfil
CREATE TABLE IF NOT EXISTS public.profile_comments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_avatar_url text,
  content text NOT NULL,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profile_comments_content_len CHECK (char_length(content) BETWEEN 1 AND 280),
  CONSTRAINT profile_comments_unique_author UNIQUE (profile_id, author_id)
);

GRANT SELECT ON public.profile_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_comments TO authenticated;
GRANT ALL ON public.profile_comments TO service_role;

CREATE INDEX IF NOT EXISTS profile_comments_profile_visible_idx
  ON public.profile_comments (profile_id, is_visible, created_at DESC);

ALTER TABLE public.profile_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read visible comments" ON public.profile_comments;
CREATE POLICY "Public can read visible comments"
  ON public.profile_comments
  FOR SELECT
  TO anon, authenticated
  USING (
    is_visible = true
    OR auth.uid() = author_id
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = profile_comments.profile_id
        AND p.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated can create own comment" ON public.profile_comments;
CREATE POLICY "Authenticated can create own comment"
  ON public.profile_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND char_length(content) BETWEEN 1 AND 280
  );

DROP POLICY IF EXISTS "Author or owner can update comment" ON public.profile_comments;
CREATE POLICY "Author or owner can update comment"
  ON public.profile_comments
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = profile_comments.profile_id
        AND p.id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = profile_comments.profile_id
        AND p.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Author or owner can delete comment" ON public.profile_comments;
CREATE POLICY "Author or owner can delete comment"
  ON public.profile_comments
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = profile_comments.profile_id
        AND p.id = auth.uid()
    )
  );

-- 7) Storage policies
DROP POLICY IF EXISTS "Public read profile assets" ON storage.objects;
CREATE POLICY "Public read profile assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-assets');

DROP POLICY IF EXISTS "Users upload their own assets" ON storage.objects;
CREATE POLICY "Users upload their own assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users update their own assets" ON storage.objects;
CREATE POLICY "Users update their own assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users delete their own assets" ON storage.objects;
CREATE POLICY "Users delete their own assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
