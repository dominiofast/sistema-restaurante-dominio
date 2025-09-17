-- Script para verificar e corrigir configurações de delivery da 300 Graus
-- Execute este script diretamente no Supabase SQL Editor

-- 1. Verificar a empresa 300 Graus
SELECT 
    c.id,
    c.name,
    c.slug,
    dm.delivery,
    dm.pickup,
    dm.eat_in,
    dm.updated_at
FROM companies c
LEFT JOIN delivery_methods dm ON dm.company_id = c.id
WHERE c.slug = '300graus' OR c.name LIKE '%300%';

-- 2. Verificar Domínio Pizzas
SELECT 
    c.id,
    c.name,
    c.slug,
    dm.delivery,
    dm.pickup,
    dm.eat_in,
    dm.updated_at
FROM companies c
LEFT JOIN delivery_methods dm ON dm.company_id = c.id
WHERE c.slug LIKE '%dominio%' OR c.name LIKE '%Dominio%' OR c.name LIKE '%Domínio%';

-- 3. CORREÇÃO: Atualizar 300 Graus para ter APENAS delivery (sem retirada)
UPDATE delivery_methods
SET 
    delivery = true,
    pickup = false,
    eat_in = false,
    updated_at = NOW()
WHERE company_id IN (
    SELECT id FROM companies 
    WHERE slug = '300graus' OR name LIKE '%300%'
);

-- 4. CORREÇÃO: Garantir que Domínio tem ambas as opções
UPDATE delivery_methods
SET 
    delivery = true,
    pickup = true,
    eat_in = false,
    updated_at = NOW()
WHERE company_id IN (
    SELECT id FROM companies 
    WHERE slug LIKE '%dominio%' OR name LIKE '%Dominio%' OR name LIKE '%Domínio%'
);

-- 5. Verificar resultados após correção
SELECT 
    c.name as empresa,
    c.slug,
    CASE 
        WHEN dm.delivery = true AND dm.pickup = true THEN '✅ Delivery + ✅ Retirada'
        WHEN dm.delivery = true AND dm.pickup = false THEN '✅ APENAS Delivery'
        WHEN dm.delivery = false AND dm.pickup = true THEN '✅ APENAS Retirada'
        ELSE '⚠️ Nenhuma opção'
    END as configuracao_atual,
    dm.updated_at as ultima_atualizacao
FROM companies c
LEFT JOIN delivery_methods dm ON dm.company_id = c.id
WHERE c.slug IN ('300graus', 'dominio-pizzas') 
   OR c.name LIKE '%300%' 
   OR c.name LIKE '%Dominio%' 
   OR c.name LIKE '%Domínio%'
ORDER BY c.name;
