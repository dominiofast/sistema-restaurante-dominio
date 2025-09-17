-- CORREÇÃO DOMINIO PIZZAS - HABILITAR PICKUP
-- Corrigir configuração de entrega para a Dominio Pizzas

UPDATE delivery_methods 
SET 
    pickup = true,      -- FORÇAR PICKUP COMO TRUE
    delivery = true,    -- Manter delivery habilitado
    eat_in = false,     -- Manter eat_in desabilitado
    updated_at = NOW()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';