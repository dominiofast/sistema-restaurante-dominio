-- CORREÇÃO GERAL - HABILITAR PICKUP PARA TODAS AS LOJAS
-- Verificar e corrigir configurações de entrega para todas as empresas

-- 1. Criar registros para empresas que não têm configuração de delivery_methods
INSERT INTO delivery_methods (company_id, delivery, pickup, eat_in)
SELECT 
    c.id,
    true as delivery,    -- Habilitar delivery por padrão
    true as pickup,      -- Habilitar pickup por padrão  
    false as eat_in      -- Manter eat_in desabilitado por padrão
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM delivery_methods dm 
    WHERE dm.company_id = c.id
)
AND c.status = 'active';

-- 2. Atualizar empresas existentes que têm pickup = false para pickup = true
UPDATE delivery_methods 
SET 
    pickup = true,           -- FORÇAR PICKUP COMO TRUE para todas
    delivery = true,         -- Garantir que delivery também esteja habilitado
    updated_at = NOW()
WHERE pickup = false OR pickup IS NULL;