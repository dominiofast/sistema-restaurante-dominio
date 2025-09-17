
-- Inserir configuração padrão de delivery methods para empresas existentes
INSERT INTO public.delivery_methods (company_id, delivery, pickup, eat_in)
SELECT 
    id as company_id,
    false as delivery,  -- Delivery desabilitado por padrão
    true as pickup,     -- Retirada habilitada por padrão
    false as eat_in     -- Consumo no local desabilitado por padrão
FROM public.companies
WHERE NOT EXISTS (
    SELECT 1 FROM public.delivery_methods dm 
    WHERE dm.company_id = companies.id
);
