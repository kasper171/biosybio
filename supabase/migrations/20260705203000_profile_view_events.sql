-- Eventos de visualização (insert público) + trigger que incrementa profiles.view_count

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
