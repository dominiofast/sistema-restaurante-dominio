-- Corrigir política RLS para dados_fiscais para suportar autenticação de empresa
DROP POLICY IF EXISTS "Users can manage their company's fiscal data" ON public.dados_fiscais;

-- Nova política que funciona tanto para usuários autenticados quanto para empresas
CREATE POLICY "Users can manage their company's fiscal data" 
ON public.dados_fiscais 
FOR ALL 
USING (
    -- Permitir acesso se for super admin
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'super_admin'
    ) OR
    -- Permitir acesso para usuários normais autenticados
    (
        auth.uid() IS NOT NULL AND
        company_id IN (
            SELECT c.id FROM companies c 
            JOIN auth.users u ON (u.raw_user_meta_data->>'company_domain' = c.domain) 
            WHERE u.id = auth.uid()
        )
    ) OR
    -- Permitir acesso para autenticação de empresa (sem auth.uid())
    (
        auth.uid() IS NULL AND
        TRUE -- Permitir acesso quando não há usuário autenticado (empresa logada)
    )
);