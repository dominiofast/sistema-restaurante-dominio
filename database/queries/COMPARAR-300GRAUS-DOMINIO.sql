-- 🔍 COMPARAR 300 GRAUS vs DOMÍNIO - ANÁLISE COMPLETA
-- Execute este script no SQL Editor do Supabase para identificar as diferenças

-- ================================
-- PASSO 1: VERIFICAR EMPRESAS
-- ================================

SELECT 
    'EMPRESAS' as tipo,
    id,
    name,
    slug,
    status,
    created_at
FROM companies 
WHERE slug IN ('300graus', 'dominiopizzas') 
   OR name LIKE '%300%graus%' 
   OR name LIKE '%Dominio%'
ORDER BY name;

-- ================================
-- PASSO 2: VERIFICAR REGIÕES DE ATENDIMENTO
-- ================================

SELECT 
    'REGIÕES DE ATENDIMENTO' as tipo,
    ra.company_id,
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
    ra.status as regiao_status,
    ra.created_at
FROM regioes_atendimento ra
JOIN companies c ON c.id = ra.company_id
WHERE c.slug IN ('300graus', 'dominiopizzas') 
   OR c.name LIKE '%300%graus%' 
   OR c.name LIKE '%Dominio%'
ORDER BY c.name, ra.raio_km;

-- ================================
-- PASSO 3: VERIFICAR MÉTODOS DE ENTREGA
-- ================================

SELECT 
    'MÉTODOS DE ENTREGA' as tipo,
    dm.company_id,
    c.name as empresa,
    dm.delivery,
    dm.pickup,
    dm.eat_in,
    dm.created_at,
    dm.updated_at
FROM delivery_methods dm
JOIN companies c ON c.id = dm.company_id
WHERE c.slug IN ('300graus', 'dominiopizzas') 
   OR c.name LIKE '%300%graus%' 
   OR c.name LIKE '%Dominio%'
ORDER BY c.name;

-- ================================
-- PASSO 4: VERIFICAR ENDEREÇOS DAS EMPRESAS
-- ================================

SELECT 
    'ENDEREÇOS DAS EMPRESAS' as tipo,
    ca.company_id,
    c.name as empresa,
    ca.logradouro,
    ca.numero,
    ca.bairro,
    ca.cidade,
    ca.estado,
    ca.latitude,
    ca.longitude,
    ca.is_principal
FROM company_addresses ca
JOIN companies c ON c.id = ca.company_id
WHERE c.slug IN ('300graus', 'dominiopizzas') 
   OR c.name LIKE '%300%graus%' 
   OR c.name LIKE '%Dominio%'
ORDER BY c.name;

-- ================================
-- PASSO 5: VERIFICAR HORÁRIOS DE FUNCIONAMENTO
-- ================================

SELECT 
    'HORÁRIOS DE FUNCIONAMENTO' as tipo,
    hf.company_id,
    c.name as empresa,
    hf.tipo_disponibilidade,
    hf.fuso_horario,
    hf.created_at,
    hf.updated_at
FROM horario_funcionamento hf
JOIN companies c ON c.id = hf.company_id
WHERE c.slug IN ('300graus', 'dominiopizzas') 
   OR c.name LIKE '%300%graus%' 
   OR c.name LIKE '%Dominio%'
ORDER BY c.name;

-- ================================
-- PASSO 5.1: VERIFICAR HORÁRIOS DETALHADOS POR DIA
-- ================================

SELECT 
    'HORÁRIOS DETALHADOS' as tipo,
    hd.horario_funcionamento_id,
    c.name as empresa,
    hd.dia_semana,
    hd.horario_inicio,
    hd.horario_fim,
    hd.ativo
FROM horarios_dias hd
JOIN horario_funcionamento hf ON hf.id = hd.horario_funcionamento_id
JOIN companies c ON c.id = hf.company_id
WHERE c.slug IN ('300graus', 'dominiopizzas') 
   OR c.name LIKE '%300%graus%' 
   OR c.name LIKE '%Dominio%'
ORDER BY c.name, hd.dia_semana;

-- ================================
-- PASSO 6: ANÁLISE COMPARATIVA
-- ================================

WITH analise_empresas AS (
    SELECT 
        c.id,
        c.name,
        c.slug,
        COUNT(ra.id) as total_regioes,
        COUNT(CASE WHEN ra.status = true THEN 1 END) as regioes_ativas,
        COUNT(CASE WHEN ra.tipo = 'raio' THEN 1 END) as regioes_raio,
        COUNT(CASE WHEN ra.tipo = 'bairro' THEN 1 END) as regioes_bairro,
        COALESCE(MAX(ra.raio_km), 0) as maior_raio,
        COALESCE(MIN(ra.valor), 0) as menor_taxa,
        COALESCE(MAX(ra.valor), 0) as maior_taxa
    FROM companies c
    LEFT JOIN regioes_atendimento ra ON ra.company_id = c.id
    WHERE c.slug IN ('300graus', 'dominiopizzas') 
       OR c.name LIKE '%300%graus%' 
       OR c.name LIKE '%Dominio%'
    GROUP BY c.id, c.name, c.slug
)
SELECT 
    'ANÁLISE COMPARATIVA' as tipo,
    name as empresa,
    slug,
    total_regioes,
    regioes_ativas,
    regioes_raio,
    regioes_bairro,
    maior_raio,
    menor_taxa,
    maior_taxa,
    CASE 
        WHEN total_regioes = 0 THEN '❌ SEM REGIÕES'
        WHEN regioes_ativas = 0 THEN '⚠️ REGIÕES INATIVAS'
        WHEN regioes_raio = 0 THEN '⚠️ SEM REGIÕES DE RAIO'
        WHEN maior_raio < 10 THEN '⚠️ RAIO PEQUENO'
        ELSE '✅ CONFIGURADO'
    END as status
FROM analise_empresas
ORDER BY name;
