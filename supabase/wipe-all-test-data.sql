-- =============================================================================
-- BIOSY — WIPE TOTAL DE DADOS DE TESTE
-- =============================================================================
--
-- ⚠️  IRREVERSÍVEL. Apaga TODAS as contas e dados de usuários.
--
-- O que é APAGADO:
--   • Contas (auth.users + login/email)
--   • Perfis e todas as configurações
--   • Templates, favoritos e usos de template
--   • Visualizações, cliques em links, comentários
--   • Blocos customizados, cargos/badges atribuídos
--   • Arquivos no Storage (bucket profile-assets: avatars, músicas, etc.)
--
-- O que é MANTIDO:
--   • Estrutura das tabelas, RLS, triggers e funções
--   • Catálogo de tipos de cargo (profile_role_types: Staff, Premium, etc.)
--   • Bucket profile-assets (vazio após o wipe)
--
-- Como executar:
--   Supabase Dashboard → SQL Editor → cole tudo → Run
--
-- Storage: o Supabase bloqueia DELETE direto por segurança. Este script usa
-- set_config('storage.allow_delete_query') — flag oficial para wipe admin.
--
-- Alternativa ao passo 1: Dashboard → Storage → profile-assets → Empty bucket
--
-- =============================================================================

BEGIN;

-- 1) Storage — mídia enviada pelos usuários
SELECT set_config('storage.allow_delete_query', 'true', true);

DELETE FROM storage.objects
WHERE bucket_id = 'profile-assets';

DELETE FROM storage.prefixes
WHERE bucket_id = 'profile-assets';

-- 2) Dados dependentes de perfis / templates (ordem segura)
DELETE FROM public.template_favorites;
DELETE FROM public.template_usages;
DELETE FROM public.profile_templates;
DELETE FROM public.profile_blocks;
DELETE FROM public.profile_link_click_events;
DELETE FROM public.profile_view_events;
DELETE FROM public.profile_comments;
DELETE FROM public.profile_roles;
DELETE FROM public.profiles;

-- 3) Contas de autenticação (login, email, sessões)
DELETE FROM auth.users;

-- 4) Reinicia numeração pública de UID (próximo perfil começa em 1000)
ALTER SEQUENCE IF EXISTS public.profile_public_uid_seq RESTART WITH 1000;

COMMIT;

-- =============================================================================
-- Verificação (tudo deve retornar 0)
-- =============================================================================
SELECT 'auth.users' AS tabela, COUNT(*)::bigint AS registros FROM auth.users
UNION ALL SELECT 'profiles', COUNT(*) FROM public.profiles
UNION ALL SELECT 'profile_templates', COUNT(*) FROM public.profile_templates
UNION ALL SELECT 'template_favorites', COUNT(*) FROM public.template_favorites
UNION ALL SELECT 'template_usages', COUNT(*) FROM public.template_usages
UNION ALL SELECT 'profile_view_events', COUNT(*) FROM public.profile_view_events
UNION ALL SELECT 'profile_link_click_events', COUNT(*) FROM public.profile_link_click_events
UNION ALL SELECT 'profile_comments', COUNT(*) FROM public.profile_comments
UNION ALL SELECT 'profile_blocks', COUNT(*) FROM public.profile_blocks
UNION ALL SELECT 'profile_roles', COUNT(*) FROM public.profile_roles
UNION ALL SELECT 'storage.objects (profile-assets)', COUNT(*) FROM storage.objects WHERE bucket_id = 'profile-assets';
