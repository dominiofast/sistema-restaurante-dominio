-- Corrigir políticas RLS da tabela produtos para isolar por empresa do usuário

-- Remover políticas problemáticas existentes
DROP POLICY IF EXISTS "Company admins can view their company produtos" ON public.produtos;
DROP POLICY IF EXISTS "Company admins can create produtos for their company" ON public.produtos;
DROP POLICY IF EXISTS "Company admins can update their company produtos" ON public.produtos;
DROP POLICY IF EXISTS "Company admins can delete their company produtos" ON public.produtos;

-- Criar políticas corretas baseadas em user_companies
CREATE POLICY "Users can view their company produtos"
ON public.produtos
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

CREATE POLICY "Users can insert their company produtos"
ON public.produtos
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

CREATE POLICY "Users can update their company produtos"
ON public.produtos
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

CREATE POLICY "Users can delete their company produtos"
ON public.produtos
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

-- Também corrigir políticas da tabela categorias se necessário
DROP POLICY IF EXISTS "Company admins can view their company categorias" ON public.categorias;
DROP POLICY IF EXISTS "Company admins can create categorias for their company" ON public.categorias;
DROP POLICY IF EXISTS "Company admins can update their company categorias" ON public.categorias;
DROP POLICY IF EXISTS "Company admins can delete their company categorias" ON public.categorias;

CREATE POLICY "Users can view their company categorias"
ON public.categorias
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

CREATE POLICY "Users can insert their company categorias"
ON public.categorias
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

CREATE POLICY "Users can update their company categorias"
ON public.categorias
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

CREATE POLICY "Users can delete their company categorias"
ON public.categorias
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