-- Badges de cargo: arquivos migrados de .png para .svg em public/badges/
UPDATE public.profile_role_types
SET icon_file = REPLACE(icon_file, '.png', '.svg')
WHERE icon_file LIKE '%.png';
