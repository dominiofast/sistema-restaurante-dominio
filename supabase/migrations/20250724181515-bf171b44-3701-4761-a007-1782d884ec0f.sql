-- Criar função para aceitar convites de usuários
CREATE OR REPLACE FUNCTION public.accept_user_invitation(
    p_token TEXT,
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    invitation_record RECORD;
BEGIN
    -- Buscar convite válido
    SELECT * INTO invitation_record 
    FROM user_invitations 
    WHERE token = p_token 
    AND accepted_at IS NULL 
    AND expires_at > NOW();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired invitation token';
    END IF;
    
    -- Marcar convite como aceito
    UPDATE user_invitations 
    SET 
        accepted_at = NOW(),
        accepted_by = p_user_id,
        updated_at = NOW()
    WHERE token = p_token;
    
    -- Criar associação usuário-empresa
    INSERT INTO user_companies (user_id, company_id, role, created_at)
    VALUES (p_user_id, invitation_record.company_id, invitation_record.role, NOW())
    ON CONFLICT (user_id, company_id) DO NOTHING;
    
END;
$$;