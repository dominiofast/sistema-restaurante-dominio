-- Corrigir políticas RLS das tabelas de caixa para não acessar auth.users diretamente
-- Remover políticas existentes que causam erro de permissão
DROP POLICY IF EXISTS "Users can view their company caixas" ON public.caixas;
DROP POLICY IF EXISTS "Users can insert their company caixas" ON public.caixas;
DROP POLICY IF EXISTS "Users can update their company caixas" ON public.caixas;
DROP POLICY IF EXISTS "Users can view their company caixa lancamentos" ON public.caixa_lancamentos;
DROP POLICY IF EXISTS "Users can insert their company caixa lancamentos" ON public.caixa_lancamentos;
DROP POLICY IF EXISTS "Users can update their company caixa lancamentos" ON public.caixa_lancamentos;
DROP POLICY IF EXISTS "Users can delete their company caixa lancamentos" ON public.caixa_lancamentos;

-- Criar função segura para verificar acesso à empresa
CREATE OR REPLACE FUNCTION public.can_access_caixa(target_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      -- Verificar se o usuário tem acesso à empresa
      WHEN EXISTS (
        SELECT 1 FROM public.companies 
        WHERE id = target_company_id 
        AND (
          -- Super admin pode acessar qualquer empresa
          ((auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin') OR
          -- Admin de empresa pode acessar sua empresa
          (domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain'))
        )
      ) THEN TRUE
      ELSE FALSE
    END;
$$;

-- Criar políticas simplificadas usando a função
CREATE POLICY "Users can view their company caixas" ON public.caixas
FOR SELECT USING (public.can_access_caixa(company_id));

CREATE POLICY "Users can insert their company caixas" ON public.caixas
FOR INSERT WITH CHECK (public.can_access_caixa(company_id));

CREATE POLICY "Users can update their company caixas" ON public.caixas
FOR UPDATE USING (public.can_access_caixa(company_id));

-- Políticas para caixa_lancamentos
CREATE POLICY "Users can view their company caixa lancamentos" ON public.caixa_lancamentos
FOR SELECT USING (public.can_access_caixa(company_id));

CREATE POLICY "Users can insert their company caixa lancamentos" ON public.caixa_lancamentos
FOR INSERT WITH CHECK (public.can_access_caixa(company_id));

CREATE POLICY "Users can update their company caixa lancamentos" ON public.caixa_lancamentos
FOR UPDATE USING (public.can_access_caixa(company_id));

CREATE POLICY "Users can delete their company caixa lancamentos" ON public.caixa_lancamentos
FOR DELETE USING (public.can_access_caixa(company_id));