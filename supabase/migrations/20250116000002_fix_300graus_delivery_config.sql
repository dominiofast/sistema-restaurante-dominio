-- Corrigir configuração de delivery da loja 300 graus
-- A loja deve ter apenas delivery habilitado, sem pickup

-- Atualizar configuração de delivery methods para 300 graus
UPDATE public.delivery_methods 
SET 
    delivery = true,   -- Habilitar delivery
    pickup = false,    -- Desabilitar pickup
    eat_in = false     -- Manter eat_in desabilitado
WHERE company_id IN (
    SELECT id 
    FROM public.companies 
    WHERE name ILIKE '%300%graus%' 
       OR name ILIKE '%graus%' 
       OR slug = '300graus'
);

-- Se não existir registro na tabela delivery_methods para a 300 graus, inserir
INSERT INTO public.delivery_methods (company_id, delivery, pickup, eat_in)
SELECT 
    id as company_id,
    true as delivery,   -- Habilitar delivery
    false as pickup,    -- Desabilitar pickup
    false as eat_in     -- Desabilitar eat_in
FROM public.companies
WHERE (name ILIKE '%300%graus%' OR name ILIKE '%graus%' OR slug = '300graus')
  AND NOT EXISTS (
      SELECT 1 FROM public.delivery_methods dm 
      WHERE dm.company_id = companies.id
  );