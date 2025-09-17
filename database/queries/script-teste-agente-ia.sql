-- 🧪 SCRIPT DE TESTE: Sistema de Configuração Automática do Agente IA
-- Data: 2025-01-27
-- Execute após aplicar os scripts principais

-- ==============================================
-- 1. VERIFICAR ESTRUTURA DAS TABELAS
-- ==============================================

SELECT 
    '🏢 EMPRESAS DISPONÍVEIS' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN slug IS NOT NULL THEN 1 END) as com_slug
FROM companies;

SELECT 
    '🤖 CONFIGURAÇÕES DE AGENTE' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN is_active = true THEN 1 END) as ativas
FROM ai_agents_config;

SELECT 
    '📦 PRODUTOS NO SISTEMA' as info,
    COUNT(*) as total,
    COUNT(DISTINCT company_id) as empresas_com_produtos
FROM produtos;

-- ==============================================
-- 2. MOSTRAR EMPRESAS E SEUS SLUGS
-- ==============================================

SELECT 
    '📋 EMPRESAS COM SLUGS:' as info,
    name as empresa,
    slug,
    'https://pedido.dominio.tech/' || slug as url_personalizada
FROM companies 
WHERE slug IS NOT NULL
ORDER BY name;

-- ==============================================
-- 3. TESTAR FUNÇÃO DE GERAÇÃO DE SLUG
-- ==============================================

SELECT 
    '🔧 TESTE DE GERAÇÃO DE SLUG:' as info,
    generate_company_slug('Teste Pizzaria & Cia!') as slug_gerado;

-- ==============================================
-- 4. VERIFICAR PRODUTOS POR EMPRESA
-- ==============================================

SELECT 
    '📊 PRODUTOS POR EMPRESA:' as info,
    c.name as empresa,
    c.slug,
    COUNT(p.id) as total_produtos,
    COUNT(CASE WHEN p.is_available = true THEN 1 END) as produtos_disponiveis,
    STRING_AGG(DISTINCT p.categoria, ', ') as categorias
FROM companies c
LEFT JOIN produtos p ON p.company_id = c.id
WHERE c.slug IS NOT NULL
GROUP BY c.id, c.name, c.slug
ORDER BY c.name;

-- ==============================================
-- 5. VERIFICAR POLÍTICAS RLS
-- ==============================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'ai_agents_config';

-- ==============================================
-- 6. SIMULAR CONFIGURAÇÃO AUTOMÁTICA
-- ==============================================

-- Mostrar exemplo do que seria gerado para a primeira empresa
WITH empresa_exemplo AS (
    SELECT 
        id,
        name,
        slug,
        'https://pedido.dominio.tech/' || slug as cardapio_url
    FROM companies 
    WHERE slug IS NOT NULL 
    LIMIT 1
),
produtos_exemplo AS (
    SELECT 
        e.name as empresa_nome,
        e.cardapio_url,
        COUNT(p.id) as total_produtos,
        STRING_AGG(
            '- **' || p.name || '**' || 
            CASE WHEN p.price IS NOT NULL THEN ' - R$ ' || p.price::text ELSE '' END ||
            CASE WHEN p.description IS NOT NULL THEN E'\n  ' || p.description ELSE '' END,
            E'\n'
        ) as lista_produtos
    FROM empresa_exemplo e
    LEFT JOIN produtos p ON p.company_id = e.id AND p.is_available = true
    GROUP BY e.name, e.cardapio_url
)
SELECT 
    '📄 EXEMPLO DE KNOWLEDGE BASE GERADA:' as info,
    E'# Informações da ' || empresa_nome || E'\n\n' ||
    '## Empresa' || E'\n' ||
    '- Nome: ' || empresa_nome || E'\n' ||
    '- Link do cardápio: ' || cardapio_url || E'\n' ||
    '- Atendimento online disponível' || E'\n\n' ||
    CASE 
        WHEN total_produtos > 0 THEN 
            '## Cardápio Disponível' || E'\n\n' ||
            lista_produtos || E'\n\n' ||
            '## Instruções para Atendimento' || E'\n' ||
            '1. Sempre forneça o link: ' || cardapio_url || E'\n' ||
            '2. Mencione produtos disponíveis quando perguntado' || E'\n' ||
            '3. Informe preços quando disponíveis' || E'\n' ||
            '4. Seja prestativo e cordial' || E'\n' ||
            '5. Encoraje o cliente a fazer o pedido online'
        ELSE
            '## Observação' || E'\n' ||
            'Ainda não há produtos cadastrados para esta empresa.' || E'\n' ||
            'Cadastre produtos no sistema para que o agente os conheça.'
    END as knowledge_base_exemplo
FROM produtos_exemplo;

-- ==============================================
-- 7. RESULTADO FINAL
-- ==============================================

DO $$
DECLARE
    total_companies INTEGER;
    companies_with_slugs INTEGER;
    total_configs INTEGER;
    total_products INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_companies FROM companies;
    SELECT COUNT(*) INTO companies_with_slugs FROM companies WHERE slug IS NOT NULL;
    SELECT COUNT(*) INTO total_configs FROM ai_agents_config;
    SELECT COUNT(*) INTO total_products FROM produtos;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 RESULTADO DO TESTE:';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Estatísticas:';
    RAISE NOTICE '- Empresas total: %', total_companies;
    RAISE NOTICE '- Empresas com slug: %', companies_with_slugs;
    RAISE NOTICE '- Configurações de agente: %', total_configs;
    RAISE NOTICE '- Produtos no sistema: %', total_products;
    RAISE NOTICE '';
    
    IF companies_with_slugs = total_companies THEN
        RAISE NOTICE '✅ SUCESSO: Todas as empresas têm slugs configurados!';
    ELSE
        RAISE NOTICE '⚠️  ATENÇÃO: % empresas ainda sem slug', (total_companies - companies_with_slugs);
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🚀 SISTEMA PRONTO PARA USO!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Como testar:';
    RAISE NOTICE '1. Acesse: Configuração → Agente IA → aba Recursos';
    RAISE NOTICE '2. Clique: "Configurar Agente Automaticamente"';
    RAISE NOTICE '3. Verifique: URL personalizada gerada';
    RAISE NOTICE '4. Confirme: Agente conhece os produtos';
    
END $$; 