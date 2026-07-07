-- Define visualizações totais nos perfis @00 e @01
-- Execute no Supabase → SQL Editor → Run

UPDATE public.profiles
SET view_count = 3200
WHERE username = '00';

UPDATE public.profiles
SET view_count = 4212
WHERE username = '01';

-- Confere o resultado
SELECT username, display_name, view_count
FROM public.profiles
WHERE username IN ('00', '01')
ORDER BY username;
