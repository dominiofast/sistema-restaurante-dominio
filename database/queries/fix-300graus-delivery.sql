-- Script para diagnosticar e corrigir o problema da empresa 300 graus

-- 1. Verificar se existe registro para a empresa
SELECT 
    c.id as company_id,
    c.name as company_name,
    dm.delivery,
    dm.pickup,
    dm.eat_in,
    dm.created_at,
    dm.updated_at
FROM companies c
LEFT JOIN delivery_methods dm ON c.id = dm.company_id
WHERE c.name ILIKE '%300%graus%' OR c.name ILIKE '%300graus%';

-- 2. Se não existir registro, criar um com pickup desabilitado
INSERT INTO delivery_methods (company_id, delivery, pickup, eat_in)
SELECT 
    c.id,
    false as delivery,
    false as pickup,  -- IMPORTANTE: pickup desabilitado
    false as eat_in
FROM companies c
WHERE (c.name ILIKE '%300%graus%' OR c.name ILIKE '%300graus%')
AND NOT EXISTS (
    SELECT 1 FROM delivery_methods dm 
    WHERE dm.company_id = c.id
);

-- 3. Atualizar registro existente para desabilitar pickup (se necessário)
UPDATE delivery_methods 
SET 
    pickup = false,
    updated_at = NOW()
WHERE company_id IN (
    SELECT id FROM companies 
    WHERE name ILIKE '%300%graus%' OR name ILIKE '%300graus%'
);

-- 4. Verificar resultado final
SELECT 
    c.id as company_id,
    c.name as company_name,
    dm.delivery,
    dm.pickup,
    dm.eat_in,
    dm.updated_at
FROM companies c
LEFT JOIN delivery_methods dm ON c.id = dm.company_id
WHERE c.name ILIKE '%300%graus%' OR c.name ILIKE '%300graus%';