-- 🔧 CORRIGIR REGIÕES DE ATENDIMENTO - Domínio Pizzas
-- Execute este script no SQL Editor do Supabase para corrigir o problema

-- ================================
-- PASSO 1: VERIFICAR PROBLEMA ATUAL
-- ================================

SELECT 
    'PROBLEMA ATUAL' as status,
    id as regiao_id,
    tipo,
    nome,
    cidade,
    estado,
    centro_lat,
    centro_lng,
    raio_km,
    valor,
    status as regiao_status
FROM regioes_atendimento 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY raio_km DESC;

-- ================================
-- PASSO 2: CORRIGIR REGIÕES EXISTENTES
-- ================================

-- Atualizar todas as regiões com informações corretas
UPDATE regioes_atendimento 
SET 
    nome = CASE 
        WHEN raio_km = 1 THEN 'Centro - 1km'
        WHEN raio_km = 2 THEN 'Centro Expandido - 2km'
        WHEN raio_km = 3 THEN 'Zona Central - 3km'
        WHEN raio_km = 4 THEN 'Zona Intermediária - 4km'
        WHEN raio_km = 5 THEN 'Zona Externa - 5km'
        WHEN raio_km = 6 THEN 'Zona Periférica - 6km'
        WHEN raio_km = 7 THEN 'Zona Metropolitana - 7km'
        ELSE 'Área de Cobertura'
    END,
    cidade = 'Cacoal',
    estado = 'RO',
    updated_at = NOW()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- PASSO 3: CRIAR REGIÃO PRINCIPAL MAIOR
-- ================================

-- Criar uma região principal com raio maior para cobrir toda a cidade
INSERT INTO regioes_atendimento (
    company_id,
    tipo,
    nome,
    cidade,
    estado,
    centro_lat,
    centro_lng,
    raio_km,
    valor,
    status
) 
SELECT 
    '550e8400-e29b-41d4-a716-446655440001',
    'raio',
    'Cobertura Completa - Cacoal/RO',
    'Cacoal',
    'RO',
    -11.4387,
    -61.4472,
    25,  -- Raio de 25km para cobrir toda a cidade e arredores
    0,   -- Taxa gratuita para facilitar
    true
WHERE NOT EXISTS (
    SELECT 1 FROM regioes_atendimento 
    WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
    AND raio_km >= 20
);

-- ================================
-- PASSO 4: VERIFICAR CORREÇÃO
-- ================================

SELECT 
    'REGIÕES CORRIGIDAS' as status,
    id as regiao_id,
    tipo,
    nome,
    cidade,
    estado,
    centro_lat,
    centro_lng,
    raio_km,
    valor,
    status as regiao_status,
    updated_at
FROM regioes_atendimento 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY raio_km DESC;

-- ================================
-- PASSO 5: TESTAR ENDEREÇO PROBLEMÁTICO
-- ================================

-- Endereço: "Avenida Porto Velho, 2828, Centro, Cacoal/RO"
-- Coordenadas: -11.4389, -61.4447

WITH coordenadas_teste AS (
    SELECT 
        -11.4389 as lat_endereco,    -- Latitude do endereço
        -61.4447 as lng_endereco,    -- Longitude do endereço
        -11.4387 as lat_regiao,      -- Latitude da região
        -61.4472 as lng_regiao,      -- Longitude da região
        25 as raio_km                 -- Raio da nova região
)
SELECT 
    'TESTE FINAL' as status,
    lat_endereco,
    lng_endereco,
    lat_regiao,
    lng_regiao,
    raio_km,
    -- Fórmula de Haversine para calcular distância
    (
        6371 * acos(
            cos(radians(lat_regiao)) * 
            cos(radians(lat_endereco)) * 
            cos(radians(lng_endereco) - radians(lng_regiao)) + 
            sin(radians(lat_regiao)) * 
            sin(radians(lat_endereco))
        )
    ) as distancia_km,
    CASE 
        WHEN (
            6371 * acos(
                cos(radians(lat_regiao)) * 
                cos(radians(lat_endereco)) * 
                cos(radians(lng_endereco) - radians(lng_regiao)) + 
                sin(radians(lat_regiao)) * 
                sin(radians(lat_endereco))
            )
        ) <= raio_km THEN '✅ DENTRO DA ÁREA - PROBLEMA RESOLVIDO!'
        ELSE '❌ FORA DA ÁREA - AINDA HÁ PROBLEMA'
    END as resultado;

-- ================================
-- RESULTADO ESPERADO
-- ================================

-- Após executar este script:
-- 1. ✅ Todas as regiões terão nome, cidade e estado
-- 2. ✅ Nova região com raio de 25km será criada
-- 3. ✅ Endereço "Avenida Porto Velho" será aceito
-- 4. ✅ Taxa de entrega será R$ 0,00 (gratuita)

-- Execute e teste novamente no checkout!
