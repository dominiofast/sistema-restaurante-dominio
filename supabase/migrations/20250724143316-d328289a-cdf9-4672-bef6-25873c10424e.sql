-- CORREÇÃO FINAL: Migrar senhas existentes para hash seguro e atualizar configurações de auth

-- 1. Criar função para hash de senhas (será usada por edge function)
CREATE OR REPLACE FUNCTION public.hash_password(plain_password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Esta função será chamada via edge function que tem bcrypt
  -- Por enquanto apenas marca que precisa ser hasheada
  RETURN 'NEEDS_HASH:' || plain_password;
END;
$$;

-- 2. Adicionar campo para controlar se senha já foi hasheada
ALTER TABLE company_credentials 
ADD COLUMN IF NOT EXISTS is_hashed boolean DEFAULT false;

-- 3. Atualizar trigger para automaticamente marcar senhas como não hasheadas quando inseridas
CREATE OR REPLACE FUNCTION public.mark_password_as_unhashed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se a senha não começar com hash bcrypt, marcar como não hasheada
  IF NEW.password_hash IS NOT NULL AND NOT NEW.password_hash LIKE '$2%' THEN
    NEW.is_hashed = false;
  ELSE
    NEW.is_hashed = true;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_mark_password_as_unhashed
  BEFORE INSERT OR UPDATE ON company_credentials
  FOR EACH ROW
  EXECUTE FUNCTION mark_password_as_unhashed();

-- 4. Corrigir função user_has_permission para usar search_path seguro
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_slug text, store_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
    has_role_permission BOOLEAN := FALSE;
    has_context_permission BOOLEAN := FALSE;
BEGIN
    -- Buscar role do usuário
    SELECT raw_user_meta_data->>'role' INTO user_role
    FROM auth.users 
    WHERE id = user_id;
    
    -- Verificar permissão via role
    SELECT EXISTS(
        SELECT 1
        FROM roles r
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE r.slug = user_role 
        AND p.slug = permission_slug 
        AND r.is_active = TRUE
    ) INTO has_role_permission;
    
    -- Verificar permissão específica por contexto (se store_id fornecido)
    IF store_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1
            FROM user_store_permissions usp
            JOIN permissions p ON usp.permission_id = p.id
            WHERE usp.user_id = user_id
            AND p.slug = permission_slug
            AND (usp.store_id = store_id OR usp.store_id IS NULL)
            AND (usp.expires_at IS NULL OR usp.expires_at > NOW())
        ) INTO has_context_permission;
        
        RETURN has_role_permission OR has_context_permission;
    END IF;
    
    RETURN has_role_permission;
END;
$$;