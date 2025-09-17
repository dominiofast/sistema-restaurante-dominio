-- 🔥 SCRIPT SIMPLES: Adicionar Promoções para Cookielab
-- Execute no SQL Editor e depois reconfigure o agente

-- Adicionar produtos promocionais para a Cookielab
INSERT INTO produtos (name, description, price, promotional_price, is_promotional, destaque, categoria, company_id, is_available) VALUES
('Cookie Chocolate Duplo', 'Cookie especial com chocolate branco e ao leite - OFERTA LIMITADA!', 12.90, 9.90, true, false, 'Cookies Especiais', '39a85df3-7a23-4b10-b260-02f595a2ab06', true),
('Combo Cookie + Café', 'Cookie especial + café expresso por um preço imperdível!', 18.90, 14.90, true, true, 'Combos', '39a85df3-7a23-4b10-b260-02f595a2ab06', true),
('Café da Casa - Promoção', 'Nosso café especial com desconto para novos clientes!', 8.90, 6.90, true, true, 'Bebidas', '39a85df3-7a23-4b10-b260-02f595a2ab06', true);

-- Mostrar as promoções criadas
SELECT 
    '🔥 PROMOÇÕES ADICIONADAS:' as info,
    name,
    'R$ ' || price || ' → R$ ' || promotional_price as preco_promocao,
    '(' || ROUND((price - promotional_price) / price * 100) || '% OFF)' as desconto
FROM produtos 
WHERE company_id = '39a85df3-7a23-4b10-b260-02f595a2ab06'
AND is_promotional = true
ORDER BY (price - promotional_price) DESC; 