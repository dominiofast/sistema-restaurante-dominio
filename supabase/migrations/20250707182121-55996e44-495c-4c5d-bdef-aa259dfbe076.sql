-- Corrigir políticas RLS para ifood_integrations
-- Primeiro, vamos remover as políticas existentes
DROP POLICY IF EXISTS "Company users can view their ifood integrations" ON public.ifood_integrations;
DROP POLICY IF EXISTS "Super admins can manage all ifood integrations" ON public.ifood_integrations;

-- Criar política para usuários autenticados verem suas integrações
CREATE POLICY "Users can view their company ifood integrations" 
ON public.ifood_integrations 
FOR SELECT 
USING (
    auth.uid() IS NOT NULL AND (
        -- Super admins podem ver todas
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'super_admin'
        )
        OR
        -- Usuários podem ver as da sua empresa
        company_id IN (
            SELECT c.id FROM companies c
            JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain
            WHERE u.id = auth.uid()
        )
    )
);

-- Super admins podem gerenciar todas as integrações
CREATE POLICY "Super admins can manage all ifood integrations" 
ON public.ifood_integrations 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'super_admin'
    )
);