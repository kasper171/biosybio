-- =============================================================================
-- BYOSY — Auditoria completa do schema (cole no Supabase → SQL Editor → Run)
-- Exporte o resultado de cada seção (ou só a seção 8) e compare com o site.
-- =============================================================================

-- ── 1) Todas as tabelas e views no schema public ─────────────────────────────
SELECT
  c.relkind AS kind,
  CASE c.relkind
    WHEN 'r' THEN 'table'
    WHEN 'v' THEN 'view'
    WHEN 'm' THEN 'materialized_view'
    ELSE c.relkind::text
  END AS type,
  n.nspname AS schema,
  c.relname AS name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'v', 'm')
ORDER BY type, name;

-- ── 2) Todas as colunas da tabela profiles ───────────────────────────────────
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ── 3) Colunas da view profiles_public ───────────────────────────────────────
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles_public'
ORDER BY ordinal_position;

-- ── 4) Funções RPC que o site usa ────────────────────────────────────────────
SELECT
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'increment_profile_view',
    'increment_profile_link_click',
    'consume_rate_limit',
    'is_username_taken',
    'profile_has_full_access',
    'get_platform_stats',
    'record_template_usage'
  )
ORDER BY p.proname;

-- ── 5) Triggers importantes em profiles ──────────────────────────────────────
SELECT
  tgname AS trigger_name,
  pg_get_triggerdef(t.oid, true) AS definition
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'profiles'
  AND NOT t.tgisinternal
ORDER BY tgname;

-- ── 6) Tabelas críticas para o site (devem existir) ───────────────────────────
SELECT
  expected.name,
  CASE WHEN c.relname IS NOT NULL THEN 'OK' ELSE 'FALTANDO' END AS status
FROM (
  VALUES
    ('profiles'),
    ('profiles_public'),
    ('profile_view_dedup'),
    ('profile_view_events'),
    ('profile_link_click_dedup'),
    ('profile_link_click_events'),
    ('profile_comments'),
    ('profile_blocks'),
    ('profile_roles'),
    ('profile_role_types'),
    ('profile_templates'),
    ('rate_limit_buckets')
) AS expected(name)
LEFT JOIN pg_class c ON c.relname = expected.name
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public';

-- ── 7) Colunas críticas em profiles (o site espera estas) ───────────────────
WITH expected(col) AS (
  VALUES
    ('id'), ('username'), ('display_name'), ('bio'),
    ('view_count'), ('show_view_count'),
    ('is_premium'), ('card_glass_enabled'),
    ('background_reveal_delay_sec'),
    ('background_blur'), ('background_brightness'),
    ('music_url'), ('music_start_sec'), ('music_end_sec'),
    ('tap_to_reveal_enabled'), ('hide_byosy_branding'),
    ('overlay_type'), ('overlay_opacity'),
    ('hotel_card_placement'), ('hotel_card_row'),
    ('page_title'), ('page_favicon_url'),
    ('link_click_count'), ('public_uid')
)
SELECT
  e.col AS column_name,
  CASE WHEN ic.column_name IS NOT NULL THEN 'OK' ELSE 'FALTANDO' END AS status
FROM expected e
LEFT JOIN information_schema.columns ic
  ON ic.table_schema = 'public'
 AND ic.table_name = 'profiles'
 AND ic.column_name = e.col
ORDER BY status DESC, e.col;

-- ── 8) RESUMO DE SAÚDE (leia esta linha primeiro) ───────────────────────────
SELECT
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS total_tables,
  (SELECT COUNT(*) FROM information_schema.views
   WHERE table_schema = 'public') AS total_views,
  EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profile_view_dedup'
  ) AS has_view_dedup,
  EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'increment_profile_view'
  ) AS has_increment_view_rpc,
  EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'consume_rate_limit'
  ) AS has_rate_limit_rpc,
  (SELECT COUNT(*) FROM public.profiles) AS profile_rows,
  (SELECT COALESCE(SUM(view_count), 0) FROM public.profiles) AS sum_view_count,
  (SELECT COUNT(*) FROM public.profile_view_dedup) AS dedup_rows,
  (SELECT COUNT(*) FROM public.profile_view_events) AS view_event_rows;

-- ── 9) Teste rápido da RPC de views (não altera nada se id inválido) ─────────
-- Troque o username abaixo:
-- SELECT public.increment_profile_view((SELECT id FROM public.profiles WHERE username = 'ksr' LIMIT 1));
