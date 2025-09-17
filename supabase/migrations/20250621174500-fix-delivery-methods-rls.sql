
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their company delivery methods" ON public.delivery_methods;
DROP POLICY IF EXISTS "Users can insert their company delivery methods" ON public.delivery_methods;
DROP POLICY IF EXISTS "Users can update their company delivery methods" ON public.delivery_methods;

-- Criar políticas usando a função can_access_company existente
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
