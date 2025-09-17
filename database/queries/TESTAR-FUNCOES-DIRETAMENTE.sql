-- 🧪 TESTAR FUNÇÕES DIRETAMENTE - Domínio Pizzas
-- Execute este script no SQL Editor do Supabase para diagnosticar o problema

-- ================================
-- PASSO 1: VERIFICAR EMPRESA
-- ================================

SELECT 
    'EMPRESA' as status,
    id as company_id,
    name as company_name,
    slug as company_slug,
    domain as company_domain,
    status as company_status,
    created_at
FROM companies 
WHERE id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- PASSO 2: VERIFICAR REGIÕES DE ATENDIMENTO
-- ================================

SELECT 
    'REGIÕES DE ATENDIMENTO' as status,
    id as regiao_id,
    company_id,
    tipo,
    nome,
    cidade,
    estado,
    centro_lat,
    centro_lng,
    raio_km,
    valor,
    status as regiao_status,
    created_at
FROM regioes_atendimento 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY created_at DESC;

-- ================================
-- PASSO 3: VERIFICAR ENDEREÇOS DE TESTE
-- ================================

-- Endereço que está sendo rejeitado: "Avenida Porto Velho, 2828, Centro, Cacoal/RO"
-- Coordenadas aproximadas: -11.4389, -61.4447

-- ================================
-- PASSO 4: TESTAR DISTÂNCIA MANUALMENTE
-- ================================

-- Função para calcular distância entre dois pontos (fórmula de Haversine)
-- Substitua as coordenadas pelas coordenadas reais da região

WITH coordenadas_teste AS (
    SELECT 
        -11.4389 as lat_endereco,  -- Latitude do endereço
        -61.4447 as lng_endereco,  -- Longitude do endereço
        -11.436026 as lat_regiao,  -- Latitude da região (substitua pela real)
        -61.4463658 as lng_regiao, -- Longitude da região (substitua pela real)
        10 as raio_km              -- Raio da região (substitua pelo real)
)
SELECT 
    'TESTE DE DISTÂNCIA' as status,
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
        ) <= raio_km THEN '✅ DENTRO DA ÁREA'
        ELSE '❌ FORA DA ÁREA'
    END as resultado
FROM coordenadas_teste;

-- ================================
-- PASSO 5: VERIFICAR CONFIGURAÇÕES DE ENTREGA
-- ================================

SELECT 
    'CONFIGURAÇÕES DE ENTREGA' as status,
    company_id,
    accept_delivery,
    accept_pickup,
    min_order_value,
    delivery_fee_type,
    created_at
FROM delivery_config 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- PASSO 6: CRIAR REGIÃO DE TESTE SE NÃO EXISTIR
-- ================================

-- Se não houver regiões, criar uma para teste
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
    'Área de Cobertura - Domínio Pizzas',
    'Cacoal',
    'RO',
    -11.4389,
    -61.4447,
    50,  -- Raio de 50km para cobrir toda a cidade
    0,   -- Taxa gratuita
    true
WHERE NOT EXISTS (
    SELECT 1 FROM regioes_atendimento 
    WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
);

-- ================================
-- RESULTADO ESPERADO
-- ================================

-- Este script deve mostrar:
-- 1. ✅ Empresa encontrada e ativa
-- 2. ✅ Regiões de atendimento configuradas
-- 3. ✅ Distância calculada corretamente
-- 4. ✅ Endereço dentro da área de cobertura
-- 5. ✅ Configurações de entrega ativas

-- Se algum item falhar, o problema está identificado!



























