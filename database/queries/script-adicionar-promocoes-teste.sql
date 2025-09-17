-- 🔥 SCRIPT: Adicionar Promoções de Teste para o Agente IA
-- Data: 2025-01-27
-- Execute este script para testar as promoções

-- ==============================================
-- 1. VERIFICAR PRODUTOS EXISTENTES
-- ==============================================

-- Mostrar produtos atuais da empresa
SELECT 
    '📦 PRODUTOS ATUAIS DA COOKIELAB:' as info,
    name as produto,
    price as preco_normal,
    promotional_price as preco_promocional,
    is_promotional as em_promocao,
    destaque,
    categoria
FROM produtos 
WHERE company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06' -- ID da Cookielab
ORDER BY categoria, name;

-- ==============================================
-- 2. ADICIONAR PROMOÇÕES DE TESTE
-- ==============================================

-- Atualizar alguns produtos existentes para serem promocionais
UPDATE produtos 
SET 
    is_promotional = true,
    promotional_price = price * 0.8  -- 20% de desconto
WHERE company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06' 
AND name LIKE '%Cookie%'
AND is_promotional IS NOT TRUE;

-- Adicionar produtos promocionais específicos se não existirem
INSERT INTO produtos (name, description, price, promotional_price, is_promotional, destaque, categoria, company_id, is_available)
SELECT 
    'Combo Cookie + Café',
    'Cookie especial + café expresso por um preço imperdível!',
    18.90,
    14.90,  -- Preço promocional
    true,   -- É promocional
    true,   -- Em destaque
    'Combos',
    '39a85df3-7a23-4b10-b260-02f595a2ab06',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM produtos 
    WHERE name = 'Combo Cookie + Café' 
    AND company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06'
);

INSERT INTO produtos (name, description, price, promotional_price, is_promotional, destaque, categoria, company_id, is_available)
SELECT 
    'Cookie Chocolate Duplo',
    'Cookie especial com chocolate branco e ao leite - OFERTA LIMITADA!',
    12.90,
    9.90,   -- Preço promocional
    true,   -- É promocional
    false,  -- Não em destaque (já é promocional)
    'Cookies Especiais',
    '39a85df3-7a23-4b10-b260-02f595a2ab06',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM produtos 
    WHERE name = 'Cookie Chocolate Duplo' 
    AND company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06'
);

INSERT INTO produtos (name, description, price, promotional_price, is_promotional, destaque, categoria, company_id, is_available)
SELECT 
    'Café da Casa - Promoção',
    'Nosso café especial com desconto especial para novos clientes!',
    8.90,
    6.90,   -- Preço promocional
    true,   -- É promocional
    true,   -- Em destaque
    'Bebidas',
    '39a85df3-7a23-4b10-b260-02f595a2ab06',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM produtos 
    WHERE name = 'Café da Casa - Promoção' 
    AND company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06'
);

-- ==============================================
-- 3. VERIFICAR PROMOÇÕES CRIADAS
-- ==============================================

-- Mostrar produtos promocionais
SELECT 
    '🔥 PROMOÇÕES ATIVAS:' as info,
    name as produto,
    'R$ ' || price::text as preco_normal,
    'R$ ' || promotional_price::text as preco_promocional,
    'R$ ' || (price - promotional_price)::text as economia,
    ROUND(((price - promotional_price) / price * 100)::numeric, 0) || '%' as desconto
FROM produtos 
WHERE company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06'
AND is_promotional = true
AND promotional_price IS NOT NULL
ORDER BY (price - promotional_price) DESC;

-- Mostrar produtos em destaque
SELECT 
    '⭐ PRODUTOS EM DESTAQUE:' as info,
    name as produto,
    'R$ ' || COALESCE(promotional_price, price)::text as preco,
    CASE WHEN is_promotional THEN 'PROMOÇÃO' ELSE 'DESTAQUE' END as tipo
FROM produtos 
WHERE company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06'
AND destaque = true
ORDER BY is_promotional DESC, name;

-- ==============================================
-- 4. RESULTADO FINAL E INSTRUÇÕES
-- ==============================================

DO $$
DECLARE
    total_products INTEGER;
    promotional_products INTEGER;
    featured_products INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_products 
    FROM produtos 
    WHERE company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06' 
    AND is_available = true;
    
    SELECT COUNT(*) INTO promotional_products 
    FROM produtos 
    WHERE company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06' 
    AND is_promotional = true 
    AND promotional_price IS NOT NULL;
    
    SELECT COUNT(*) INTO featured_products 
    FROM produtos 
    WHERE company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06' 
    AND destaque = true;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 RESULTADO DA CONFIGURAÇÃO DE PROMOÇÕES:';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Estatísticas da Cookielab:';
    RAISE NOTICE '- Total de produtos: %', total_products;
    RAISE NOTICE '- Produtos em promoção: %', promotional_products;
    RAISE NOTICE '- Produtos em destaque: %', featured_products;
    RAISE NOTICE '';
    
    IF promotional_products > 0 THEN
        RAISE NOTICE '✅ PROMOÇÕES CONFIGURADAS COM SUCESSO!';
        RAISE NOTICE '';
        RAISE NOTICE '📋 Próximos passos:';
        RAISE NOTICE '1. Vá em: Configuração → Agente IA → aba Recursos';
        RAISE NOTICE '2. Clique: "Configurar Agente Automaticamente"';
        RAISE NOTICE '3. Teste perguntando: "tem alguma promoção?"';
        RAISE NOTICE '4. O agente deve mencionar as % promoções específicas!', promotional_products;
        RAISE NOTICE '';
        RAISE NOTICE '🔥 Agora quando perguntarem sobre promoção, o agente vai responder:';
        RAISE NOTICE '"Sim! Temos % promoções ativas hoje:"', promotional_products;
        RAISE NOTICE 'E listar cada promoção com preços específicos!';
    ELSE
        RAISE NOTICE '⚠️  ATENÇÃO: Nenhuma promoção foi configurada.';
        RAISE NOTICE 'Verifique se a empresa Cookielab existe no sistema.';
    END IF;
    
END $$; 