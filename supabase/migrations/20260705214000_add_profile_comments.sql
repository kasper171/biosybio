ALTER TABLE public.profiles
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

NOTIFY pgrst, 'reload schema';
