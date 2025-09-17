-- 🧪 TESTE ESPECÍFICO: CÁLCULO DE ENTREGA DOMÍNIO PIZZAS
-- Script para testar exatamente o que acontece no cálculo de taxa

-- ================================
-- CONFIGURAÇÕES DE TESTE
-- ================================

-- ID da Domínio Pizzas (conforme migrations)
SET @dominio_id = '550e8400-e29b-41d4-a716-446655440001';

-- Coordenadas de teste (centro de Cacoal/RO)
SET @test_lat = -11.4389;
SET @test_lng = -61.4447;

-- ================================
-- PASSO 1: VERIFICAR SE A EMPRESA EXISTE
-- ================================

SELECT 
    '1. VERIFICAÇÃO DA EMPRESA' as teste,
    id,
    name,
    slug,
    status,
    CASE 
        WHEN id = '550e8400-e29b-41d4-a716-446655440001' THEN '✅ ID CORRETO'
        ELSE '❌ ID INCORRETO'
    END as status_id
FROM companies 
WHERE id = '550e8400-e29b-41d4-a716-446655440001'
   OR slug = 'dominiopizzas'
   OR name ILIKE '%dominio%';

-- ================================
-- PASSO 2: VERIFICAR REGIÕES DE ATENDIMENTO
-- ================================

SELECT 
    '2. REGIÕES DE ATENDIMENTO' as teste,
    id as regiao_id,
    tipo,
    nome,
    cidade,
    estado,
    centro_lat,
    centro_lng,
    raio_km,
    valor,
    status,
    created_at,
    CASE 
        WHEN status = true THEN '✅ ATIVA'
        ELSE '❌ INATIVA'
    END as status_regiao,
    CASE 
        WHEN centro_lat IS NOT NULL AND centro_lng IS NOT NULL THEN '✅ TEM COORDENADAS'
        ELSE '❌ SEM COORDENADAS'
    END as status_coordenadas
FROM regioes_atendimento 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY raio_km;

-- ================================
-- PASSO 3: SIMULAR CÁLCULO DE DISTÂNCIA
-- ================================

-- Função para calcular distância (Haversine)
WITH calculo_distancia AS (
    SELECT 
        ra.id as regiao_id,
        ra.nome,
        ra.tipo,
        ra.raio_km,
        ra.valor,
        ra.centro_lat,
        ra.centro_lng,
        @test_lat as endereco_lat,
        @test_lng as endereco_lng,
        -- Cálculo de distância usando fórmula Haversine
        (
            6371 * acos(
                cos(radians(@test_lat)) * 
                cos(radians(ra.centro_lat)) * 
                cos(radians(ra.centro_lng) - radians(@test_lng)) + 
                sin(radians(@test_lat)) * 
                sin(radians(ra.centro_lat))
            )
        ) as distancia_km,
        CASE 
            WHEN ra.tipo = 'raio' THEN
                CASE 
                    WHEN (
                        6371 * acos(
                            cos(radians(@test_lat)) * 
                            cos(radians(ra.centro_lat)) * 
                            cos(radians(ra.centro_lng) - radians(@test_lng)) + 
                            sin(radians(@test_lat)) * 
                            sin(radians(ra.centro_lat))
                        )
                    ) <= ra.raio_km THEN '✅ DENTRO DO RAIO'
                    ELSE '❌ FORA DO RAIO'
                END
            ELSE 'N/A (não é raio)'
        END as status_cobertura
    FROM regioes_atendimento ra
    WHERE ra.company_id = '550e8400-e29b-41d4-a716-446655440001'
      AND ra.status = true
)
SELECT 
    '3. SIMULAÇÃO DE CÁLCULO' as teste,
    regiao_id,
    nome,
    tipo,
    raio_km,
    valor,
    ROUND(distancia_km, 2) as distancia_calculada_km,
    status_cobertura,
    CASE 
        WHEN status_cobertura = '✅ DENTRO DO RAIO' THEN CONCAT('Taxa: R$ ', valor)
        ELSE 'Fora da área de cobertura'
    END as resultado_taxa
FROM calculo_distancia
ORDER BY distancia_calculada_km;

-- ================================
-- PASSO 4: VERIFICAR MÉTODOS DE ENTREGA
-- ================================

SELECT 
    '4. MÉTODOS DE ENTREGA' as teste,
    company_id,
    delivery,
    pickup,
    eat_in,
    created_at,
    updated_at,
    CASE 
        WHEN delivery = true OR pickup = true THEN '✅ MÉTODOS ATIVOS'
        ELSE '❌ NENHUM MÉTODO ATIVO'
    END as status_metodos
FROM delivery_methods 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- PASSO 5: CRIAR REGIÃO DE TESTE SE NECESSÁRIO
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
    'Área de Teste - Domínio Pizzas',
    'Cacoal',
    'RO',
    -11.4389,
    -61.4447,
    50,  -- Raio de 50km
    0,   -- Taxa gratuita
    true
WHERE NOT EXISTS (
    SELECT 1 FROM regioes_atendimento 
    WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
    AND status = true
);

-- ================================
-- PASSO 6: VERIFICAR RESULTADO FINAL
-- ================================

SELECT 
    '6. RESULTADO FINAL' as teste,
    COUNT(*) as total_regioes_ativas,
    COUNT(CASE WHEN tipo = 'raio' THEN 1 END) as regioes_raio,
    MAX(raio_km) as maior_raio,
    MIN(valor) as menor_taxa,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PRONTO PARA FUNCIONAR'
        ELSE '❌ AINDA COM PROBLEMA'
    END as status_final
FROM regioes_atendimento 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
  AND status = true;

-- ================================
-- DIAGNÓSTICO ESPERADO:
-- ================================
-- Se este script mostrar:
-- 1. ✅ Empresa encontrada
-- 2. ✅ Regiões ativas com coordenadas
-- 3. ✅ Cálculo de distância funcionando
-- 4. ✅ Métodos de entrega ativos
-- 5. ✅ Resultado final OK
--
-- Então o problema NÃO está no banco de dados!
-- O problema está no frontend/JavaScript.
--
-- Se algum item falhar, sabemos exatamente onde corrigir!