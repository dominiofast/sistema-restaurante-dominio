-- Corrigir a função create_user_invitation para permitir super admins
CREATE OR REPLACE FUNCTION public.create_user_invitation(
  p_email text,
  p_company_id uuid,
  p_role text DEFAULT 'admin'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_id uuid;
  invitation_token text;
  current_user_role text;
BEGIN
  -- Verificar se o usuário está autenticado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Buscar role do usuário atual
  SELECT COALESCE(raw_user_meta_data->>'role', 'user') INTO current_user_role
  FROM auth.users 
  WHERE id = auth.uid();
  
  -- Permitir apenas super_admin ou usuários com associação à empresa
  IF current_user_role != 'super_admin' THEN
    -- Verificar se o usuário tem acesso à empresa
    IF NOT EXISTS (
      SELECT 1 FROM user_companies 
      WHERE user_id = auth.uid() AND company_id = p_company_id
    ) THEN
      RAISE EXCEPTION 'Sem permissão para criar convites';
    END IF;
  END IF;
  
  -- Verificar se já existe convite pendente para este email/empresa
  IF EXISTS (
    SELECT 1 FROM user_invitations 
    WHERE email = p_email 
    AND company_id = p_company_id 
    AND accepted_at IS NULL 
    AND expires_at > now()
  ) THEN
    RAISE EXCEPTION 'Já existe um convite pendente para este email nesta empresa';
  END IF;
  
  -- Gerar token único
  invitation_token := encode(gen_random_bytes(32), 'hex');
  
  -- Criar convite
  INSERT INTO user_invitations (
    email,
    company_id,
    role,
    token,
    invited_by,
    expires_at
  ) VALUES (
    p_email,
    p_company_id,
    p_role,
    invitation_token,
    auth.uid(),
    now() + interval '7 days'
  ) RETURNING id INTO invitation_id;
  
  RETURN invitation_id;
END;
$$;