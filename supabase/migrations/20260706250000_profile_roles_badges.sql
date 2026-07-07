-- =============================================================================
-- Cargos / badges de perfil (Staff, Staff Dev, Premium, Donator, Gifter)
-- =============================================================================

-- Tipos de cargo (catálogo fixo)
CREATE TABLE IF NOT EXISTS public.profile_role_types (
  id text PRIMARY KEY,
  label text NOT NULL,
  icon_file text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  grants_full_access boolean NOT NULL DEFAULT false,
  tooltip_template text NOT NULL
);

INSERT INTO public.profile_role_types (id, label, icon_file, sort_order, grants_full_access, tooltip_template)
VALUES
  ('staff_dev', 'Staff Dev', 'staffdev.png', 10, true, 'Developer da equipe desde {date}'),
  ('staff', 'Staff', 'staff.png', 20, true, 'Staff desde {date}'),
  ('premium', 'Premium', 'premium.png', 30, true, 'Premium desde {date}'),
  ('donator', 'Donator', 'donator.png', 40, true, 'Fez uma doação e apoiou o site'),
  ('gifter', 'Gifter', 'gifter.png', 50, true, 'Presenteou alguém com um premium.')
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  icon_file = EXCLUDED.icon_file,
  sort_order = EXCLUDED.sort_order,
  grants_full_access = EXCLUDED.grants_full_access,
  tooltip_template = EXCLUDED.tooltip_template;

-- Cargos atribuídos a cada perfil
CREATE TABLE IF NOT EXISTS public.profile_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id text NOT NULL REFERENCES public.profile_role_types(id) ON DELETE RESTRICT,
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  CONSTRAINT profile_roles_unique UNIQUE (profile_id, role_id)
);

CREATE INDEX IF NOT EXISTS profile_roles_profile_idx
  ON public.profile_roles (profile_id, granted_at DESC);

-- Preferências de exibição no perfil
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_role_badges boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS role_badges_monochrome boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS role_badges_mono_color text NOT NULL DEFAULT '#ffffff';

COMMENT ON COLUMN public.profiles.show_role_badges IS 'Exibir badges de cargo no card do perfil';
COMMENT ON COLUMN public.profiles.role_badges_monochrome IS 'Aplicar filtro monocromático inteligente nos badges';
COMMENT ON COLUMN public.profiles.role_badges_mono_color IS 'Cor base do filtro monocromático dos badges';

-- Acesso total (molduras premium, etc.)
CREATE OR REPLACE FUNCTION public.profile_has_full_access(target_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = target_profile_id
      AND p.is_premium = true
  )
  OR EXISTS (
    SELECT 1
    FROM public.profile_roles pr
    JOIN public.profile_role_types rt ON rt.id = pr.role_id
    WHERE pr.profile_id = target_profile_id
      AND rt.grants_full_access = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.profile_has_full_access(uuid) TO anon, authenticated;

-- Sincroniza is_premium quando cargo premium é adicionado/removido
CREATE OR REPLACE FUNCTION public.sync_profile_premium_from_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles p
  SET is_premium = public.profile_has_full_access(
    COALESCE(NEW.profile_id, OLD.profile_id)
  )
  WHERE p.id = COALESCE(NEW.profile_id, OLD.profile_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_premium_on_role_change ON public.profile_roles;
CREATE TRIGGER trg_sync_premium_on_role_change
  AFTER INSERT OR UPDATE OR DELETE ON public.profile_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_premium_from_roles();

-- RLS
ALTER TABLE public.profile_role_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read role types" ON public.profile_role_types;
CREATE POLICY "Anyone can read role types"
  ON public.profile_role_types
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can read profile roles" ON public.profile_roles;
CREATE POLICY "Anyone can read profile roles"
  ON public.profile_roles
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Staff can insert roles" ON public.profile_roles;
CREATE POLICY "Staff can insert roles"
  ON public.profile_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id = auth.uid()
        AND pr.role_id IN ('staff', 'staff_dev')
    )
  );

DROP POLICY IF EXISTS "Staff can update roles" ON public.profile_roles;
CREATE POLICY "Staff can update roles"
  ON public.profile_roles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id = auth.uid()
        AND pr.role_id IN ('staff', 'staff_dev')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id = auth.uid()
        AND pr.role_id IN ('staff', 'staff_dev')
    )
  );

DROP POLICY IF EXISTS "Staff can delete roles" ON public.profile_roles;
CREATE POLICY "Staff can delete roles"
  ON public.profile_roles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id = auth.uid()
        AND pr.role_id IN ('staff', 'staff_dev')
    )
  );

GRANT SELECT ON public.profile_role_types TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_roles TO authenticated;

-- =============================================================================
-- EXEMPLOS — atribuir cargos (rode no SQL Editor; troque USER_ID)
-- =============================================================================
--
-- -- Primeiro staff (bootstrap manual, sem RLS de staff ainda):
-- INSERT INTO public.profile_roles (profile_id, role_id, notes)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'staff_dev', 'Bootstrap')
-- ON CONFLICT (profile_id, role_id) DO NOTHING;
--
-- INSERT INTO public.profile_roles (profile_id, role_id) VALUES
--   ('USER_ID', 'premium', now()),
--   ('USER_ID', 'donator', now())
-- ON CONFLICT (profile_id, role_id) DO NOTHING;
--
-- SELECT pr.*, rt.label FROM public.profile_roles pr
-- JOIN public.profile_role_types rt ON rt.id = pr.role_id
-- WHERE pr.profile_id = 'USER_ID';
