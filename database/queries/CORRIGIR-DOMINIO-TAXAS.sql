-- 🔧 CORRIGIR TAXAS DAS REGIÕES DA DOMÍNIO PIZZAS
-- Aplicar a mesma configuração da 300 Graus (todas as regiões com taxa 0)

-- ================================
-- PASSO 1: VERIFICAR REGIÕES ATUAIS DA DOMÍNIO
-- ================================

SELECT 
    'REGIÕES ATUAIS DA DOMÍNIO' as status,
    ra.id,
    ra.nome,
    ra.tipo,
    ra.raio_km,
    ra.valor,
    ra.status,
    ra.cidade,
    ra.estado
FROM regioes_atendimento ra
JOIN companies c ON c.id = ra.company_id
WHERE c.slug = 'dominiopizzas'
ORDER BY ra.raio_km;

-- ================================
-- PASSO 2: CORRIGIR TODAS AS REGIÕES PARA TAXA 0
-- ================================

UPDATE regioes_atendimento 
SET 
    valor = 0,
    updated_at = NOW()
WHERE company_id IN (
    SELECT id FROM companies WHERE slug = 'dominiopizzas'
);

-- ================================
-- PASSO 3: VERIFICAR RESULTADO APÓS CORREÇÃO
-- ================================

SELECT 
    'REGIÕES CORRIGIDAS DA DOMÍNIO' as status,
    ra.id,
    ra.nome,
    ra.tipo,
    ra.raio_km,
    ra.valor,
    ra.status,
    ra.cidade,
    ra.estado,
    ra.updated_at
FROM regioes_atendimento ra
JOIN companies c ON c.id = ra.company_id
WHERE c.slug = 'dominiopizzas'
ORDER BY ra.raio_km;

-- ================================
-- PASSO 4: COMPARAR COM 300 GRAUS
-- ================================

SELECT 
    'COMPARAÇÃO FINAL' as status,
    c.name as empresa,
    c.slug,
    COUNT(ra.id) as total_regioes,
    COUNT(CASE WHEN ra.status = true THEN 1 END) as regioes_ativas,
    COALESCE(MAX(ra.raio_km), 0) as maior_raio,
    COALESCE(MIN(ra.valor), 0) as menor_taxa,
    COALESCE(MAX(ra.valor), 0) as maior_taxa,
    CASE 
        WHEN COALESCE(MAX(ra.valor), 0) = 0 THEN '✅ TODAS GRATUITAS'
        ELSE '❌ ALGUMAS COM TAXA'
    END as status_taxa
FROM companies c
LEFT JOIN regioes_atendimento ra ON ra.company_id = c.id
WHERE c.slug IN ('300graus', 'dominiopizzas')
GROUP BY c.id, c.name, c.slug
ORDER BY c.name;
