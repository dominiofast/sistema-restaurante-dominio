-- Remover política temporária de debug
DROP POLICY IF EXISTS "TEMP DEBUG - Allow all authenticated users to view clientes" ON public.clientes;

-- Remover todas as políticas existentes problemáticas
DROP POLICY IF EXISTS "Company users can manage their clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can manage their company clients" ON public.clientes;

-- Criar políticas simples e funcionais
CREATE POLICY "Users can view their company clients"
ON public.clientes
FOR SELECT
TO authenticated
USING (
    company_id IN (
        SELECT uc.company_id 
        FROM user_companies uc 
        WHERE uc.user_id = auth.uid() 
        AND uc.is_active = true
    )
);

CREATE POLICY "Users can insert their company clients"
ON public.clientes
FOR INSERT
TO authenticated
WITH CHECK (
    company_id IN (
        SELECT uc.company_id 
        FROM user_companies uc 
        WHERE uc.user_id = auth.uid() 
        AND uc.is_active = true
    )
);

CREATE POLICY "Users can update their company clients"
ON public.clientes
FOR UPDATE
TO authenticated
USING (
    company_id IN (
        SELECT uc.company_id 
        FROM user_companies uc 
        WHERE uc.user_id = auth.uid() 
        AND uc.is_active = true
    )
)
WITH CHECK (
    company_id IN (
        SELECT uc.company_id 
        FROM user_companies uc 
        WHERE uc.user_id = auth.uid() 
        AND uc.is_active = true
    )
);

CREATE POLICY "Users can delete their company clients"
ON public.clientes
FOR DELETE
TO authenticated
USING (
    company_id IN (
        SELECT uc.company_id 
        FROM user_companies uc 
        WHERE uc.user_id = auth.uid() 
        AND uc.is_active = true
    )
);