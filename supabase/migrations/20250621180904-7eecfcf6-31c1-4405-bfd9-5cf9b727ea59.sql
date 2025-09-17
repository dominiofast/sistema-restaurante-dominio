
-- Remover políticas antigas que estão causando o erro
DROP POLICY IF EXISTS "Users can view their company delivery methods" ON public.delivery_methods;
DROP POLICY IF EXISTS "Users can insert their company delivery methods" ON public.delivery_methods;  
DROP POLICY IF EXISTS "Users can update their company delivery methods" ON public.delivery_methods;
DROP POLICY IF EXISTS "Users can delete their company delivery methods" ON public.delivery_methods;

-- Recriar políticas usando a função can_access_company correta
CREATE POLICY "Users can view their company delivery methods" ON public.delivery_methods
    FOR SELECT
    USING (public.can_access_company(company_id));

CREATE POLICY "Users can insert their company delivery methods" ON public.delivery_methods
    FOR INSERT
    WITH CHECK (public.can_access_company(company_id));

CREATE POLICY "Users can update their company delivery methods" ON public.delivery_methods
    FOR UPDATE
    USING (public.can_access_company(company_id));

CREATE POLICY "Users can delete their company delivery methods" ON public.delivery_methods
    FOR DELETE
    USING (public.can_access_company(company_id));

-- Garantir configuração padrão para empresas que não têm
INSERT INTO public.delivery_methods (company_id, delivery, pickup, eat_in)
SELECT 
    id as company_id,
    false as delivery,
    true as pickup,
    false as eat_in
FROM public.companies
WHERE NOT EXISTS (
    SELECT 1 FROM public.delivery_methods dm 
    WHERE dm.company_id = companies.id
);
