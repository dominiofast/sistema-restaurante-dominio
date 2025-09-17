-- Criar políticas RLS para a tabela user_invitations
-- Permitir leitura pública de convites não aceitos e não expirados
CREATE POLICY "Allow public to read valid invitations" 
ON user_invitations 
FOR SELECT 
USING (
  accepted_at IS NULL 
  AND expires_at > NOW()
);

-- Permitir que usuários autenticados atualizem convites (para aceitar)
CREATE POLICY "Allow authenticated users to update invitations" 
ON user_invitations 
FOR UPDATE 
USING (
  accepted_at IS NULL 
  AND expires_at > NOW()
) 
WITH CHECK (
  accepted_at IS NOT NULL 
  OR expires_at > NOW()
);