-- Corrigir políticas RLS da tabela ai_global_prompt_template
-- O problema é que a política de leitura pode não estar funcionando corretamente

-- Primeiro, remover políticas existentes
DROP POLICY IF EXISTS "read_global_prompt_template" ON ai_global_prompt_template;
DROP POLICY IF EXISTS "Super admins manage global templates" ON ai_global_prompt_template;

-- Criar nova política de leitura pública mais permissiva
CREATE POLICY "public_read_global_template" 
ON ai_global_prompt_template 
FOR SELECT 
TO public
USING (true);

-- Política para super admins gerenciarem (com verificação mais robusta)
CREATE POLICY "super_admin_manage_global_template" 
ON ai_global_prompt_template 
FOR ALL 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (
    -- Verificar se é super admin via user metadata
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin'
    OR
    -- Fallback: verificar se a função get_user_role existe e retorna super_admin
    (EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_role') AND get_user_role() = 'super_admin')
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (
    -- Verificar se é super admin via user metadata
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin'
    OR
    -- Fallback: verificar se a função get_user_role existe e retorna super_admin
    (EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_role') AND get_user_role() = 'super_admin')
  )
);

-- Garantir que a política está ativa
ALTER TABLE ai_global_prompt_template ENABLE ROW LEVEL SECURITY;