-- Define visualizações totais nos perfis @00 e @01
-- Execute no Supabase → SQL Editor → Run

UPDATE public.profiles
SET view_count = 5321
WHERE username = '00';

UPDATE public.profiles
SET view_count = 6921
WHERE username = '01';

-- Confere o resultado
SELECT username, display_name, view_count
FROM public.profiles
WHERE username IN ('00', '01')
ORDER BY username;
