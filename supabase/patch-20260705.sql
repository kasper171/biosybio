-- Rode no SQL Editor do Supabase se o projeto já existia antes desta atualização.
-- Seguro para executar mais de uma vez (IF NOT EXISTS).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS effect_glow_color text NOT NULL DEFAULT '#ff2d7a',
  ADD COLUMN IF NOT EXISTS effect_glow_size integer NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS social_icon_color text NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS social_icon_style text NOT NULL DEFAULT 'boxed',
  ADD COLUMN IF NOT EXISTS avatar_border_color text NOT NULL DEFAULT '#ff2d7a',
  ADD COLUMN IF NOT EXISTS avatar_border_width numeric NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS avatar_size numeric NOT NULL DEFAULT 96,
  ADD COLUMN IF NOT EXISTS discord_user_id text,
  ADD COLUMN IF NOT EXISTS discord_card_mode text NOT NULL DEFAULT 'inside',
  ADD COLUMN IF NOT EXISTS discord_show_badges boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS inner_banner_pos_x numeric NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS inner_banner_pos_y numeric NOT NULL DEFAULT 50;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS background_blur integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS background_brightness integer NOT NULL DEFAULT 100;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS view_count bigint NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_view_count boolean NOT NULL DEFAULT true;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_username boolean NOT NULL DEFAULT true;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tap_to_reveal_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tap_reveal_blur integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS tap_reveal_brightness integer NOT NULL DEFAULT 55,
  ADD COLUMN IF NOT EXISTS tap_reveal_mode text NOT NULL DEFAULT 'avatar_text',
  ADD COLUMN IF NOT EXISTS tap_reveal_text text NOT NULL DEFAULT 'Toque para revelar';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS card_reveal_effect text NOT NULL DEFAULT 'fade';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS text_typing_effect boolean NOT NULL DEFAULT true;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS text_typing_name_effect boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS text_typing_bio_effect boolean NOT NULL DEFAULT true;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS music_url text,
  ADD COLUMN IF NOT EXISTS music_title text,
  ADD COLUMN IF NOT EXISTS music_start_sec numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS music_end_sec numeric,
  ADD COLUMN IF NOT EXISTS comments_enabled boolean NOT NULL DEFAULT true;

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

-- Eventos de visualização (método principal)
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

-- Espessura da borda aceita decimais (ex: 0.4px)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'card_border_width'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE public.profiles
      ALTER COLUMN card_border_width TYPE numeric USING card_border_width::numeric;
  END IF;
END $$;

-- Recarrega o cache de schema do PostgREST (evita erro "column not found in schema cache")
NOTIFY pgrst, 'reload schema';
