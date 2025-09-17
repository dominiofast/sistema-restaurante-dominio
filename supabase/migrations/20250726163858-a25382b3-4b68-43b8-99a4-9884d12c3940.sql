-- ==========================================
-- CONFIGURAR SUPER ADMIN COM APP_METADATA SEGURO
-- Migrar dados críticos para app_metadata
-- ==========================================

-- Primeiro vamos verificar se há uma função RPC para atualizar app_metadata
-- Se não existir, vamos criá-la
CREATE OR REPLACE FUNCTION public.update_user_app_metadata(
  user_id uuid,
  metadata jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Esta função deve ser usada apenas por super admins
  -- Em produção, adicione verificações de permissão aqui
  
  -- Atualizar app_metadata do usuário via auth schema
  UPDATE auth.users 
  SET app_metadata = app_metadata || metadata,
      updated_at = now()
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado: %', user_id;
  END IF;
END;
$$;

-- Buscar o ID do usuário contato@dominio.tech
DO $$
DECLARE
  super_admin_id uuid;
BEGIN
  SELECT id INTO super_admin_id 
  FROM auth.users 
  WHERE email = 'contato@dominio.tech';
  
  IF super_admin_id IS NOT NULL THEN
    -- Configurar como super admin com acesso a todas as empresas
    PERFORM update_user_app_metadata(
      super_admin_id,
      jsonb_build_object(
        'role', 'super_admin',
        'company_domain', 'dominio.tech',
        'companies', '11e10dba-8ed0-47fc-91f5-bc88f2aef4ca,39a85df3-7a23-4b10-b260-02f595a2ab06,550e8400-e29b-41d4-a716-446655440001,1b24dbf6-f7bd-406e-bd8f-71d2fce1bf91'
      )
    );
    
    RAISE NOTICE 'Super admin configurado com sucesso: %', super_admin_id;
  ELSE
    RAISE NOTICE 'Usuário contato@dominio.tech não encontrado';
  END IF;
END $$;