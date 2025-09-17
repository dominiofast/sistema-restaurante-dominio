-- Corrigir políticas RLS para tabelas de caixa
-- Remover políticas existentes
DROP POLICY IF EXISTS "Allow authenticated users to manage caixas" ON public.caixas;
DROP POLICY IF EXISTS "Allow authenticated users to manage caixa_lancamentos" ON public.caixa_lancamentos;

-- Criar políticas que verificam a empresa do usuário
CREATE POLICY "Users can view their company caixas" ON public.caixas
FOR SELECT USING (
    company_id IN (
        SELECT c.id FROM companies c 
        JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
        WHERE u.id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
    )
);

CREATE POLICY "Users can insert their company caixas" ON public.caixas
FOR INSERT WITH CHECK (
    company_id IN (
        SELECT c.id FROM companies c 
        JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
        WHERE u.id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
    )
);

CREATE POLICY "Users can update their company caixas" ON public.caixas
FOR UPDATE USING (
    company_id IN (
        SELECT c.id FROM companies c 
        JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
        WHERE u.id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
    )
);

-- Criar políticas para caixa_lancamentos
CREATE POLICY "Users can view their company caixa lancamentos" ON public.caixa_lancamentos
FOR SELECT USING (
    company_id IN (
        SELECT c.id FROM companies c 
        JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
        WHERE u.id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
    )
);

CREATE POLICY "Users can insert their company caixa lancamentos" ON public.caixa_lancamentos
FOR INSERT WITH CHECK (
    company_id IN (
        SELECT c.id FROM companies c 
        JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
        WHERE u.id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
    )
);

CREATE POLICY "Users can update their company caixa lancamentos" ON public.caixa_lancamentos
FOR UPDATE USING (
    company_id IN (
        SELECT c.id FROM companies c 
        JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
        WHERE u.id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
    )
);

CREATE POLICY "Users can delete their company caixa lancamentos" ON public.caixa_lancamentos
FOR DELETE USING (
    company_id IN (
        SELECT c.id FROM companies c 
        JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
        WHERE u.id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
    )
);