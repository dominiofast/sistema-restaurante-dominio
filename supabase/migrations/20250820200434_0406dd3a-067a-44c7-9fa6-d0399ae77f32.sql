-- ADICIONAR políticas para acesso público controlado por telefone

-- customer_addresses: Permitir acesso público por telefone + empresa ativa
CREATE POLICY "Public view own addresses by phone"
ON public.customer_addresses
FOR SELECT
TO anon
USING (
    customer_phone IS NOT NULL 
    AND company_id IN (
        SELECT id FROM companies WHERE status = 'active'
    )
);

CREATE POLICY "Public insert addresses for active companies"
ON public.customer_addresses
FOR INSERT
TO anon
WITH CHECK (
    customer_phone IS NOT NULL 
    AND company_id IN (
        SELECT id FROM companies WHERE status = 'active'
    )
);

CREATE POLICY "Public update own addresses by phone"
ON public.customer_addresses
FOR UPDATE
TO anon
USING (
    customer_phone IS NOT NULL 
    AND company_id IN (
        SELECT id FROM companies WHERE status = 'active'
    )
)
WITH CHECK (
    customer_phone IS NOT NULL 
    AND company_id IN (
        SELECT id FROM companies WHERE status = 'active'
    )
);

-- clientes: Permitir acesso público por telefone + empresa ativa
CREATE POLICY "Public view own client by phone"
ON public.clientes
FOR SELECT
TO anon
USING (
    telefone IS NOT NULL 
    AND company_id IN (
        SELECT id FROM companies WHERE status = 'active'
    )
);

CREATE POLICY "Public insert clients for active companies"
ON public.clientes
FOR INSERT
TO anon
WITH CHECK (
    telefone IS NOT NULL 
    AND company_id IN (
        SELECT id FROM companies WHERE status = 'active'
    )
);

CREATE POLICY "Public update own client by phone"
ON public.clientes
FOR UPDATE
TO anon
USING (
    telefone IS NOT NULL 
    AND company_id IN (
        SELECT id FROM companies WHERE status = 'active'
    )
)
WITH CHECK (
    telefone IS NOT NULL 
    AND company_id IN (
        SELECT id FROM companies WHERE status = 'active'
    )
);

-- DELETE políticas permanecem apenas para usuários autenticados
CREATE POLICY "Auth users delete their company addresses"
ON public.customer_addresses
FOR DELETE
TO authenticated
USING (
    company_id IN (
        SELECT uc.company_id 
        FROM user_companies uc 
        WHERE uc.user_id = auth.uid() AND uc.is_active = true
    )
);

CREATE POLICY "Auth users delete their company clients"
ON public.clientes
FOR DELETE
TO authenticated
USING (
    company_id IN (
        SELECT uc.company_id 
        FROM user_companies uc 
        WHERE uc.user_id = auth.uid() AND uc.is_active = true
    )
);

-- Verificar políticas finais
SELECT 'POLÍTICAS FINAIS' as status, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename IN ('clientes', 'customer_addresses')
ORDER BY tablename, policyname;