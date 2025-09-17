-- 🔥 SCRIPT CORRIGIDO: Adicionar Promoções para Cookielab
-- Execute no SQL Editor e depois reconfigure o agente

-- Primeiro, criar as categorias se não existirem
INSERT INTO categorias (name, company_id, is_active, order_position)
SELECT 'Cookies Especiais', '39a85df3-7a23-4b10-b260-02f595a2ab06', true, 1
WHERE NOT EXISTS (
    SELECT 1 FROM categorias 
    WHERE name = 'Cookies Especiais' 
    AND company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06'
);

INSERT INTO categorias (name, company_id, is_active, order_position)
SELECT 'Combos', '39a85df3-7a23-4b10-b260-02f595a2ab06', true, 2
WHERE NOT EXISTS (
    SELECT 1 FROM categorias 
    WHERE name = 'Combos' 
    AND company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06'
);

INSERT INTO categorias (name, company_id, is_active, order_position)
SELECT 'Bebidas', '39a85df3-7a23-4b10-b260-02f595a2ab06', true, 3
WHERE NOT EXISTS (
    SELECT 1 FROM categorias 
    WHERE name = 'Bebidas' 
    AND company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06'
);

-- Agora adicionar os produtos promocionais usando categoria_id
INSERT INTO produtos (name, description, price, promotional_price, is_promotional, destaque, categoria_id, company_id, is_available)
SELECT 
    'Cookie Chocolate Duplo',
    'Cookie especial com chocolate branco e ao leite - OFERTA LIMITADA!',
    12.90,
    9.90,
    true,
    false,
    c.id,
    '39a85df3-7a23-4b10-b260-02f595a2ab06',
    true
FROM categorias c
WHERE c.name = 'Cookies Especiais' 
AND c.company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06'
AND NOT EXISTS (
    SELECT 1 FROM produtos 
    WHERE name = 'Cookie Chocolate Duplo' 
    AND company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06'
);

INSERT INTO produtos (name, description, price, promotional_price, is_promotional, destaque, categoria_id, company_id, is_available)
SELECT 
    'Combo Cookie + Café',
    'Cookie especial + café expresso por um preço imperdível!',
    18.90,
    14.90,
    true,
    true,
    c.id,
    '39a85df3-7a23-4b10-b260-02f595a2ab06',
    true
FROM categorias c
WHERE c.name = 'Combos' 
AND c.company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06'
AND NOT EXISTS (
    SELECT 1 FROM produtos 
    WHERE name = 'Combo Cookie + Café' 
    AND company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06'
);

INSERT INTO produtos (name, description, price, promotional_price, is_promotional, destaque, categoria_id, company_id, is_available)
SELECT 
    'Café da Casa - Promoção',
    'Nosso café especial com desconto para novos clientes!',
    8.90,
    6.90,
    true,
    true,
    c.id,
    '39a85df3-7a23-4b10-b260-02f595a2ab06',
    true
FROM categorias c
WHERE c.name = 'Bebidas' 
AND c.company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06'
AND NOT EXISTS (
    SELECT 1 FROM produtos 
    WHERE name = 'Café da Casa - Promoção' 
    AND company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06'
);

-- Mostrar as promoções criadas
SELECT 
    '🔥 PROMOÇÕES ADICIONADAS:' as info,
    p.name,
    c.name as categoria,
    'R$ ' || p.price || ' → R$ ' || p.promotional_price as preco_promocao,
    '(' || ROUND((p.price - p.promotional_price) / p.price * 100) || '% OFF)' as desconto
FROM produtos p
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06'
AND p.is_promotional = true
ORDER BY (p.price - p.promotional_price) DESC; 