-- Inserir configuração de delivery methods para 300 graus
-- Esta migração garante que a loja 300 graus tenha apenas delivery habilitado

INSERT INTO public.delivery_methods (company_id, delivery, pickup, eat_in, created_at, updated_at)
SELECT 
    c.id,
    true as delivery,
    false as pickup, 
    false as eat_in,
    NOW() as created_at,
    NOW() as updated_at
FROM public.companies c 
WHERE c.slug = '300graus'
  AND NOT EXISTS (
    SELECT 1 FROM public.delivery_methods dm 
    WHERE dm.company_id = c.id
  );

-- Se já existir um registro, atualizar para garantir a configuração correta
UPDATE public.delivery_methods 
SET 
    delivery = true,
    pickup = false,
    eat_in = false,
    updated_at = NOW()
WHERE company_id = (
    SELECT id FROM public.companies WHERE slug = '300graus'
);

-- Verificar se a configuração foi aplicada corretamente
DO $$
DECLARE
    config_record RECORD;
BEGIN
    SELECT dm.delivery, dm.pickup, dm.eat_in, c.name
    INTO config_record
    FROM public.delivery_methods dm
    JOIN public.companies c ON c.id = dm.company_id
    WHERE c.slug = '300graus';
    
    IF FOUND THEN
        RAISE NOTICE 'Configuração aplicada para %: delivery=%, pickup=%, eat_in=%', 
            config_record.name, config_record.delivery, config_record.pickup, config_record.eat_in;
    ELSE
        RAISE NOTICE 'Nenhuma configuração encontrada para 300graus';
    END IF;
END $$;