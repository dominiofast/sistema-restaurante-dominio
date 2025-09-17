-- ====================================================================
-- CORREÇÃO ESPECÍFICA PARA QUADRATA PIZZAS - APENAS DELIVERY
-- ====================================================================

-- 1. Verificar configuração atual da Quadrata Pizzas
SELECT 
    c.id,
    c.name,
    c.slug,
    dm.delivery,
    dm.pickup,
    dm.eat_in,
    CASE 
        WHEN dm.delivery = true AND dm.pickup = true THEN '📦 Delivery + 🏪 Retirada'
        WHEN dm.delivery = true AND dm.pickup = false THEN '📦 APENAS Delivery'
        WHEN dm.delivery = false AND dm.pickup = true THEN '🏪 APENAS Retirada'
        ELSE '⚠️ Configuração Inválida'
    END as configuracao_atual
FROM companies c
LEFT JOIN delivery_methods dm ON dm.company_id = c.id
WHERE c.slug = 'quadratapizzas' 
   OR LOWER(c.name) LIKE '%quadrata%';

-- 2. CORRIGIR: Quadrata Pizzas deve ter APENAS delivery
UPDATE delivery_methods
SET 
    delivery = true,    -- Habilitar delivery
    pickup = false,     -- DESABILITAR retirada
    eat_in = false,     -- Desabilitar consumo local
    updated_at = NOW()
WHERE company_id IN (
    SELECT id FROM companies 
    WHERE slug = 'quadratapizzas' 
       OR LOWER(name) LIKE '%quadrata%'
);

-- 3. Verificar após correção
SELECT 
    c.id,
    c.name,
    c.slug,
    dm.delivery,
    dm.pickup,
    dm.eat_in,
    CASE 
        WHEN dm.delivery = true AND dm.pickup = true THEN '📦 Delivery + 🏪 Retirada'
        WHEN dm.delivery = true AND dm.pickup = false THEN '📦 APENAS Delivery'
        WHEN dm.delivery = false AND dm.pickup = true THEN '🏪 APENAS Retirada'
        ELSE '⚠️ Configuração Inválida'
    END as configuracao_nova
FROM companies c
LEFT JOIN delivery_methods dm ON dm.company_id = c.id
WHERE c.slug = 'quadratapizzas' 
   OR LOWER(c.name) LIKE '%quadrata%';

-- 4. Verificar todas as configurações atuais
SELECT * FROM company_delivery_config ORDER BY empresa;
