-- SOLUÇÃO COMPLETA PARA DELIVERY METHODS
-- Execute este SQL no banco de dados

-- 1. VERIFICAR ESTADO ATUAL DE TODAS AS EMPRESAS
SELECT 
    c.name as empresa,
    c.id as company_id,
    c.domain,
    dm.delivery,
    dm.pickup,
    dm.eat_in,
    dm.created_at,
    dm.updated_at
FROM companies c
LEFT JOIN delivery_methods dm ON c.id = dm.company_id
ORDER BY c.name;

-- 2. VERIFICAR ESPECIFICAMENTE A DOMINIO
SELECT 
    c.name as empresa,
    c.id as company_id,
    c.domain,
    dm.delivery,
    dm.pickup,
    dm.eat_in,
    dm.created_at,
    dm.updated_at
FROM companies c
LEFT JOIN delivery_methods dm ON c.id = dm.company_id
WHERE c.name ILIKE '%dominio%';

-- 3. CORRIGIR DOMINIO ESPECIFICAMENTE (se necessário)
UPDATE delivery_methods 
SET 
    delivery = true,
    pickup = true,     -- FORÇAR PICKUP COMO TRUE
    eat_in = false,
    updated_at = NOW()
WHERE company_id IN (
    SELECT id FROM companies 
    WHERE name ILIKE '%dominio%'
);

-- 4. VERIFICAR SE A CORREÇÃO FUNCIONOU
SELECT 
    c.name as empresa,
    c.id as company_id,
    dm.delivery,
    dm.pickup,
    dm.eat_in,
    dm.updated_at
FROM companies c
LEFT JOIN delivery_methods dm ON c.id = dm.company_id
WHERE c.name ILIKE '%dominio%';

-- 5. CRIAR REGISTROS PARA EMPRESAS SEM CONFIGURAÇÃO
INSERT INTO delivery_methods (company_id, delivery, pickup, eat_in)
SELECT 
    c.id,
    false as delivery,
    true as pickup,    -- Pickup habilitado por padrão
    false as eat_in
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM delivery_methods dm 
    WHERE dm.company_id = c.id
);

-- 6. VERIFICAR POLÍTICAS RLS (se houver problemas de permissão)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'delivery_methods';

-- 7. TEMPORARIAMENTE DESABILITAR RLS PARA TESTE (CUIDADO!)
-- ALTER TABLE delivery_methods DISABLE ROW LEVEL SECURITY;

-- 8. REABILITAR RLS APÓS TESTE
-- ALTER TABLE delivery_methods ENABLE ROW LEVEL SECURITY;

-- 9. VERIFICAR USUÁRIOS E PERMISSÕES
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'role' as role,
    u.raw_user_meta_data->>'company_domain' as company_domain
FROM auth.users u
WHERE u.raw_user_meta_data->>'company_domain' LIKE '%dominio%';

-- 10. RESULTADO FINAL - VERIFICAR TODAS AS EMPRESAS
SELECT 
    c.name as empresa,
    c.domain,
    CASE 
        WHEN dm.pickup = true THEN '✅ PICKUP HABILITADO'
        WHEN dm.pickup = false THEN '❌ PICKUP DESABILITADO'
        ELSE '⚠️ SEM CONFIGURAÇÃO'
    END as status_pickup,
    CASE 
        WHEN dm.delivery = true THEN '✅ DELIVERY HABILITADO'
        WHEN dm.delivery = false THEN '❌ DELIVERY DESABILITADO'
        ELSE '⚠️ SEM CONFIGURAÇÃO'
    END as status_delivery
FROM companies c
LEFT JOIN delivery_methods dm ON c.id = dm.company_id
ORDER BY c.name;