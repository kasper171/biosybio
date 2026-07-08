-- Rate limit para signup e checagens server-side (rode se ainda não aplicou security_complete).

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

NOTIFY pgrst, 'reload schema';
