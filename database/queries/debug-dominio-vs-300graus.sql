-- 🔍 DEBUG: COMPARAR 300 GRAUS vs DOMÍNIO PIZZAS
-- Script para identificar exatamente onde está o problema

-- ================================
-- PASSO 1: VERIFICAR SE AS EMPRESAS EXISTEM
-- ================================

SELECT 
    '1. EMPRESAS ENCONTRADAS' as etapa,
    id,
    name,
    slug,
    domain,
    status,
    created_at
FROM companies 
WHERE slug IN ('300graus', 'dominiopizzas') 
   OR name ILIKE '%300%graus%' 
   OR name ILIKE '%dominio%'
   OR name ILIKE '%domínio%'
ORDER BY name;

-- ================================
-- PASSO 2: VERIFICAR REGIÕES DE ATENDIMENTO
-- ================================

SELECT 
    '2. REGIÕES DE ATENDIMENTO' as etapa,
    c.name as empresa,
    c.slug,
    COUNT(ra.id) as total_regioes,
    COUNT(CASE WHEN ra.status = true THEN 1 END) as regioes_ativas,
    STRING_AGG(ra.tipo, ', ') as tipos_regiao,
    COALESCE(MAX(ra.raio_km), 0) as maior_raio,
    COALESCE(MIN(ra.valor), 0) as menor_taxa,
    COALESCE(MAX(ra.valor), 0) as maior_taxa
FROM companies c
LEFT JOIN regioes_atendimento ra ON ra.company_id = c.id
WHERE c.slug IN ('300graus', 'dominiopizzas') 
   OR c.name ILIKE '%300%graus%' 
   OR c.name ILIKE '%dominio%'
   OR c.name ILIKE '%domínio%'
GROUP BY c.id, c.name, c.slug
ORDER BY c.name;

-- ================================
-- PASSO 3: VERIFICAR MÉTODOS DE ENTREGA
-- ================================

SELECT 
    '3. MÉTODOS DE ENTREGA' as etapa,
    c.name as empresa,
    c.slug,
    COALESCE(dm.delivery, false) as delivery,
    COALESCE(dm.pickup, false) as pickup,
    COALESCE(dm.eat_in, false) as eat_in,
    dm.created_at,
    dm.updated_at
FROM companies c
LEFT JOIN delivery_methods dm ON dm.company_id = c.id
WHERE c.slug IN ('300graus', 'dominiopizzas') 
   OR c.name ILIKE '%300%graus%' 
   OR c.name ILIKE '%dominio%'
   OR c.name ILIKE '%domínio%'
ORDER BY c.name;

-- ================================
-- PASSO 4: VERIFICAR ENDEREÇOS DAS EMPRESAS
-- ================================

SELECT 
    '4. ENDEREÇOS DAS EMPRESAS' as etapa,
    c.name as empresa,
    c.slug,
    COUNT(ca.id) as total_enderecos,
    COUNT(CASE WHEN ca.is_principal = true THEN 1 END) as endereco_principal,
    MAX(ca.latitude) as latitude,
    MAX(ca.longitude) as longitude,
    MAX(ca.cidade) as cidade,
    MAX(ca.estado) as estado
FROM companies c
LEFT JOIN company_addresses ca ON ca.company_id = c.id
WHERE c.slug IN ('300graus', 'dominiopizzas') 
   OR c.name ILIKE '%300%graus%' 
   OR c.name ILIKE '%dominio%'
   OR c.name ILIKE '%domínio%'
GROUP BY c.id, c.name, c.slug
ORDER BY c.name;

-- ================================
-- PASSO 5: DIAGNÓSTICO FINAL
-- ================================

WITH diagnostico AS (
    SELECT 
        c.id,
        c.name,
        c.slug,
        COUNT(ra.id) as total_regioes,
        COUNT(CASE WHEN ra.status = true THEN 1 END) as regioes_ativas,
        COALESCE(dm.delivery, false) as tem_delivery,
        COALESCE(dm.pickup, false) as tem_pickup,
        COUNT(ca.id) as total_enderecos,
        CASE 
            WHEN COUNT(ra.id) = 0 THEN '❌ SEM REGIÕES'
            WHEN COUNT(CASE WHEN ra.status = true THEN 1 END) = 0 THEN '❌ REGIÕES INATIVAS'
            WHEN NOT COALESCE(dm.delivery, false) AND NOT COALESCE(dm.pickup, false) THEN '❌ SEM MÉTODOS DE ENTREGA'
            WHEN COUNT(ca.id) = 0 THEN '⚠️ SEM ENDEREÇO'
            ELSE '✅ CONFIGURADO'
        END as status_diagnostico
    FROM companies c
    LEFT JOIN regioes_atendimento ra ON ra.company_id = c.id
    LEFT JOIN delivery_methods dm ON dm.company_id = c.id
    LEFT JOIN company_addresses ca ON ca.company_id = c.id
    WHERE c.slug IN ('300graus', 'dominiopizzas') 
       OR c.name ILIKE '%300%graus%' 
       OR c.name ILIKE '%dominio%'
       OR c.name ILIKE '%domínio%'
    GROUP BY c.id, c.name, c.slug, dm.delivery, dm.pickup
)
SELECT 
    '5. DIAGNÓSTICO FINAL' as etapa,
    name as empresa,
    slug,
    total_regioes,
    regioes_ativas,
    tem_delivery,
    tem_pickup,
    total_enderecos,
    status_diagnostico
FROM diagnostico
ORDER BY name;

-- ================================
-- PASSO 6: DETALHES DAS REGIÕES (SE EXISTIREM)
-- ================================

SELECT 
    '6. DETALHES DAS REGIÕES' as etapa,
    c.name as empresa,
    ra.id as regiao_id,
    ra.tipo,
    ra.nome,
    ra.cidade,
    ra.estado,
    ra.centro_lat,
    ra.centro_lng,
    ra.raio_km,
    ra.valor,
    ra.status as regiao_ativa,
    ra.created_at
FROM companies c
JOIN regioes_atendimento ra ON ra.company_id = c.id
WHERE c.slug IN ('300graus', 'dominiopizzas') 
   OR c.name ILIKE '%300%graus%' 
   OR c.name ILIKE '%dominio%'
   OR c.name ILIKE '%domínio%'
ORDER BY c.name, ra.raio_km;

-- ================================
-- RESULTADO ESPERADO:
-- ================================
-- 300 Graus: ✅ Deve ter regiões ativas e métodos configurados
-- Domínio: ❌ Provavelmente faltando regiões ou configurações
-- Este script mostrará exatamente onde está a diferença!