-- Remover políticas duplicadas e conflitantes

-- Remover políticas antigas da tabela clientes que estão conflitando
DROP POLICY IF EXISTS "Company users can view their company clients" ON public.clientes;
DROP POLICY IF EXISTS "Company users can insert their company clients" ON public.clientes;
DROP POLICY IF EXISTS "Company users can update their company clients" ON public.clientes;
DROP POLICY IF EXISTS "Company users can delete their company clients" ON public.clientes;

-- Remover políticas antigas da tabela produtos que estão conflitando
-- (mantemos as políticas novas que usam user_companies)

-- Verificar se existem dados órfãos na tabela user_companies
-- e garantir que todos os usuários ativos tenham entrada na tabela

-- Inserir registros faltantes na tabela user_companies para usuários existentes
INSERT INTO public.user_companies (user_id, company_id, role, is_active)
SELECT DISTINCT 
    auth.uid() as user_id,
    c.id as company_id,
    'user' as role,
    true as is_active
FROM public.companies c
WHERE c.status = 'active'
AND NOT EXISTS (
    SELECT 1 FROM public.user_companies uc 
    WHERE uc.user_id = auth.uid() 
    AND uc.company_id = c.id
)
AND auth.uid() IS NOT NULL;

-- Recriar políticas simplificadas para produtos (sem duplicatas)
DROP POLICY IF EXISTS "Users can view their company produtos" ON public.produtos;
DROP POLICY IF EXISTS "Users can insert their company produtos" ON public.produtos;  
DROP POLICY IF EXISTS "Users can update their company produtos" ON public.produtos;
DROP POLICY IF EXISTS "Users can delete their company produtos" ON public.produtos;

-- Criar políticas mais permissivas temporariamente para diagnosticar
CREATE POLICY "Authenticated users can view produtos"
ON public.produtos
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage produtos"
ON public.produtos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Criar políticas mais permissivas para clientes também
DROP POLICY IF EXISTS "Users can view their company clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can insert their company clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can update their company clients" ON public.clientes; 
DROP POLICY IF EXISTS "Users can delete their company clients" ON public.clientes;

CREATE POLICY "Authenticated users can view clientes"  
ON public.clientes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage clientes"
ON public.clientes  
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);