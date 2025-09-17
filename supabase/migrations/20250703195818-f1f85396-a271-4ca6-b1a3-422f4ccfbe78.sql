-- Verificar e corrigir políticas RLS para tipos_fiscais
DROP POLICY IF EXISTS "Users can manage their company's fiscal types" ON public.tipos_fiscais;

-- Criar política mais permissiva para tipos_fiscais
CREATE POLICY "Users can manage their company's fiscal types" 
ON public.tipos_fiscais 
FOR ALL 
USING (
    company_id IN (
        SELECT c.id FROM companies c 
        JOIN auth.users u ON (u.raw_user_meta_data->>'company_domain' = c.domain) 
        WHERE u.id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
    )
);

-- Verificar e corrigir políticas RLS para clientes (se necessário)
-- As políticas já existem mas vamos garantir que estão corretas