-- Política para permitir que usuários anônimos vejam configurações do Asaas de empresas ativas
CREATE POLICY "Allow public read asaas_config for active companies" ON public.asaas_config
    FOR SELECT USING (
        is_active = true AND company_id IN (
            SELECT id FROM companies WHERE status = 'active'
        )
    );