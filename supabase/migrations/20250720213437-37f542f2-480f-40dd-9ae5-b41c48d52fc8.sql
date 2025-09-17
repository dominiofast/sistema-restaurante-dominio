-- Verificar e corrigir políticas RLS para cardapio_branding
-- Remover políticas existentes problemáticas
DROP POLICY IF EXISTS "Users can insert branding for their company" ON cardapio_branding;
DROP POLICY IF EXISTS "Users can update branding of their company" ON cardapio_branding;

-- Criar políticas RLS mais simples e funcionais
CREATE POLICY "Allow authenticated users to insert branding" 
ON cardapio_branding 
FOR INSERT 
TO authenticated 
WITH CHECK (
    -- Super admin pode inserir para qualquer empresa
    (((auth.jwt() -> 'raw_user_meta_data'::text) ->> 'role'::text) = 'super_admin'::text) OR
    -- Usuário pode inserir para sua empresa
    (company_id IN (
        SELECT c.id FROM companies c 
        WHERE c.domain = ((auth.jwt() -> 'raw_user_meta_data'::text) ->> 'company_domain'::text)
    ))
);

CREATE POLICY "Allow authenticated users to update branding" 
ON cardapio_branding 
FOR UPDATE 
TO authenticated 
USING (
    -- Super admin pode atualizar qualquer empresa
    (((auth.jwt() -> 'raw_user_meta_data'::text) ->> 'role'::text) = 'super_admin'::text) OR
    -- Usuário pode atualizar sua empresa
    (company_id IN (
        SELECT c.id FROM companies c 
        WHERE c.domain = ((auth.jwt() -> 'raw_user_meta_data'::text) ->> 'company_domain'::text)
    ))
)
WITH CHECK (
    -- Super admin pode atualizar qualquer empresa
    (((auth.jwt() -> 'raw_user_meta_data'::text) ->> 'role'::text) = 'super_admin'::text) OR
    -- Usuário pode atualizar sua empresa
    (company_id IN (
        SELECT c.id FROM companies c 
        WHERE c.domain = ((auth.jwt() -> 'raw_user_meta_data'::text) ->> 'company_domain'::text)
    ))
);