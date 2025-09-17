
-- Limpar dados existentes
DELETE FROM produtos WHERE company_id IN (SELECT id FROM companies);
DELETE FROM categorias WHERE company_id IN (SELECT id FROM companies);
DELETE FROM categorias_adicionais WHERE company_id IN (SELECT id FROM companies);
DELETE FROM adicionais;
DELETE FROM companies;

-- Inserir as novas empresas
INSERT INTO public.companies (id, name, domain, logo, plan, status, user_count) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Domínio Pizzas', 'dominiopizzas', '🍕', 'pro', 'active', 8),
('550e8400-e29b-41d4-a716-446655440002', 'Domínio Burger', 'dominioburger', '🍔', 'basic', 'active', 5),
('550e8400-e29b-41d4-a716-446655440003', 'Domínio Distribuidora', 'dominiodistribuidora', '📦', 'enterprise', 'active', 15);

-- Criar categorias para Domínio Pizzas
INSERT INTO public.categorias (id, name, description, order_position, company_id) VALUES
('a50e8400-e29b-41d4-a716-446655440001', 'Pizzas Tradicionais', 'Nossas deliciosas pizzas tradicionais', 1, '550e8400-e29b-41d4-a716-446655440001'),
('a50e8400-e29b-41d4-a716-446655440002', 'Pizzas Especiais', 'Pizzas com ingredientes premium', 2, '550e8400-e29b-41d4-a716-446655440001'),
('a50e8400-e29b-41d4-a716-446655440003', 'Bebidas', 'Refrigerantes e sucos', 3, '550e8400-e29b-41d4-a716-446655440001'),
('a50e8400-e29b-41d4-a716-446655440004', 'Sobremesas', 'Doces e sobremesas', 4, '550e8400-e29b-41d4-a716-446655440001');

-- Criar categorias para Domínio Burger
INSERT INTO public.categorias (id, name, description, order_position, company_id) VALUES
('b50e8400-e29b-41d4-a716-446655440001', 'Hamburgers Artesanais', 'Hamburgers feitos com ingredientes selecionados', 1, '550e8400-e29b-41d4-a716-446655440002'),
('b50e8400-e29b-41d4-a716-446655440002', 'Porções', 'Batatas e petiscos', 2, '550e8400-e29b-41d4-a716-446655440002'),
('b50e8400-e29b-41d4-a716-446655440003', 'Bebidas', 'Refrigerantes e sucos naturais', 3, '550e8400-e29b-41d4-a716-446655440002'),
('b50e8400-e29b-41d4-a716-446655440004', 'Combos', 'Combos especiais', 4, '550e8400-e29b-41d4-a716-446655440002');

-- Criar categorias para Domínio Distribuidora
INSERT INTO public.categorias (id, name, description, order_position, company_id) VALUES
('c50e8400-e29b-41d4-a716-446655440001', 'Alimentos Básicos', 'Arroz, feijão, açúcar e outros', 1, '550e8400-e29b-41d4-a716-446655440003'),
('c50e8400-e29b-41d4-a716-446655440002', 'Bebidas', 'Refrigerantes, sucos e águas', 2, '550e8400-e29b-41d4-a716-446655440003'),
('c50e8400-e29b-41d4-a716-446655440003', 'Limpeza', 'Produtos de limpeza e higiene', 3, '550e8400-e29b-41d4-a716-446655440003'),
('c50e8400-e29b-41d4-a716-446655440004', 'Congelados', 'Carnes e produtos congelados', 4, '550e8400-e29b-41d4-a716-446655440003');

-- Produtos para Domínio Pizzas
INSERT INTO public.produtos (name, description, price, categoria_id, company_id, is_available, destaque) VALUES
('Pizza Margherita', 'Molho de tomate, mussarela e manjericão', 45.90, 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', true, true),
('Pizza Calabresa', 'Molho de tomate, mussarela e calabresa', 48.90, 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', true, false),
('Pizza Portuguesa', 'Molho de tomate, mussarela, presunto, ovos e cebola', 52.90, 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', true, false),
('Pizza 4 Queijos', 'Mussarela, gorgonzola, parmesão e catupiry', 58.90, 'a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', true, true),
('Pizza Camarão', 'Molho de tomate, mussarela, camarão e catupiry', 68.90, 'a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', true, false),
('Coca-Cola 2L', 'Refrigerante Coca-Cola 2 litros', 12.90, 'a50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', true, false),
('Pudim de Leite', 'Pudim caseiro de leite condensado', 8.90, 'a50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', true, false);

-- Produtos para Domínio Burger
INSERT INTO public.produtos (name, description, price, categoria_id, company_id, is_available, destaque) VALUES
('Burger Clássico', 'Hambúrguer 180g, queijo, alface, tomate e molho especial', 28.90, 'b50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', true, true),
('Burger Bacon', 'Hambúrguer 180g, bacon, queijo cheddar e molho barbecue', 32.90, 'b50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', true, true),
('Burger Vegano', 'Hambúrguer de grão-de-bico, alface, tomate e molho vegano', 26.90, 'b50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', true, false),
('Batata Frita Grande', 'Porção grande de batata frita sequinha', 18.90, 'b50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', true, false),
('Onion Rings', 'Anéis de cebola empanados e fritos', 16.90, 'b50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', true, false),
('Suco Natural 500ml', 'Suco natural de frutas da estação', 8.90, 'b50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', true, false),
('Combo Clássico', 'Burger Clássico + Batata + Refrigerante', 42.90, 'b50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', true, true);

-- Produtos para Domínio Distribuidora
INSERT INTO public.produtos (name, description, price, categoria_id, company_id, is_available, destaque) VALUES
('Arroz Tipo 1 - 5kg', 'Arroz branco tipo 1, pacote de 5kg', 18.90, 'c50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', true, true),
('Feijão Carioca - 1kg', 'Feijão carioca selecionado', 8.50, 'c50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', true, false),
('Açúcar Cristal - 1kg', 'Açúcar cristal refinado especial', 4.90, 'c50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', true, false),
('Coca-Cola 2L', 'Refrigerante Coca-Cola 2 litros', 8.90, 'c50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', true, false),
('Água Mineral 1,5L', 'Água mineral natural sem gás', 3.50, 'c50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', true, false),
('Detergente Neutro', 'Detergente líquido neutro 500ml', 2.90, 'c50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', true, false),
('Carne Bovina - 1kg', 'Carne bovina congelada primeira qualidade', 32.90, 'c50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', true, true);

-- Categorias de adicionais para Pizzas
INSERT INTO public.categorias_adicionais (id, name, description, selection_type, is_required, max_selection, company_id) VALUES
('d50e8400-e29b-41d4-a716-446655440001', 'Tamanho da Pizza', 'Escolha o tamanho da sua pizza', 'single', true, 1, '550e8400-e29b-41d4-a716-446655440001'),
('d50e8400-e29b-41d4-a716-446655440002', 'Ingredientes Extras', 'Adicione ingredientes extras', 'multiple', false, 5, '550e8400-e29b-41d4-a716-446655440001'),
('d50e8400-e29b-41d4-a716-446655440003', 'Massa', 'Tipo de massa', 'single', false, 1, '550e8400-e29b-41d4-a716-446655440001');

-- Categorias de adicionais para Burger
INSERT INTO public.categorias_adicionais (id, name, description, selection_type, is_required, max_selection, company_id) VALUES
('e50e8400-e29b-41d4-a716-446655440001', 'Ponto da Carne', 'Como você quer sua carne?', 'single', true, 1, '550e8400-e29b-41d4-a716-446655440002'),
('e50e8400-e29b-41d4-a716-446655440002', 'Adicionais', 'Incremente seu burger', 'multiple', false, 8, '550e8400-e29b-41d4-a716-446655440002');

-- Adicionais para Pizza - Tamanhos
INSERT INTO public.adicionais (name, description, price, categoria_adicional_id, is_available) VALUES
('Pizza Pequena (25cm)', '4 fatias', 0.00, 'd50e8400-e29b-41d4-a716-446655440001', true),
('Pizza Média (30cm)', '6 fatias', 8.00, 'd50e8400-e29b-41d4-a716-446655440001', true),
('Pizza Grande (35cm)', '8 fatias', 15.00, 'd50e8400-e29b-41d4-a716-446655440001', true),
('Pizza Família (40cm)', '12 fatias', 25.00, 'd50e8400-e29b-41d4-a716-446655440001', true);

-- Adicionais para Pizza - Ingredientes Extras
INSERT INTO public.adicionais (name, description, price, categoria_adicional_id, is_available) VALUES
('Bacon', 'Bacon crocante', 5.00, 'd50e8400-e29b-41d4-a716-446655440002', true),
('Catupiry', 'Queijo catupiry original', 4.00, 'd50e8400-e29b-41d4-a716-446655440002', true),
('Champignon', 'Cogumelos frescos', 3.50, 'd50e8400-e29b-41d4-a716-446655440002', true),
('Azeitona', 'Azeitonas pretas', 2.50, 'd50e8400-e29b-41d4-a716-446655440002', true),
('Cebola Roxa', 'Cebola roxa fatiada', 2.00, 'd50e8400-e29b-41d4-a716-446655440002', true);

-- Adicionais para Pizza - Massas
INSERT INTO public.adicionais (name, description, price, categoria_adicional_id, is_available) VALUES
('Massa Tradicional', 'Massa tradicional fina', 0.00, 'd50e8400-e29b-41d4-a716-446655440003', true),
('Massa Integral', 'Massa integral saudável', 3.00, 'd50e8400-e29b-41d4-a716-446655440003', true),
('Borda Recheada', 'Borda recheada com catupiry', 8.00, 'd50e8400-e29b-41d4-a716-446655440003', true);

-- Adicionais para Burger - Ponto da Carne
INSERT INTO public.adicionais (name, description, price, categoria_adicional_id, is_available) VALUES
('Mal Passado', 'Carne mal passada', 0.00, 'e50e8400-e29b-41d4-a716-446655440001', true),
('Ao Ponto', 'Carne ao ponto', 0.00, 'e50e8400-e29b-41d4-a716-446655440001', true),
('Bem Passado', 'Carne bem passada', 0.00, 'e50e8400-e29b-41d4-a716-446655440001', true);

-- Adicionais para Burger - Extras
INSERT INTO public.adicionais (name, description, price, categoria_adicional_id, is_available) VALUES
('Bacon Extra', 'Fatias extras de bacon', 4.00, 'e50e8400-e29b-41d4-a716-446655440002', true),
('Queijo Extra', 'Fatia extra de queijo', 3.00, 'e50e8400-e29b-41d4-a716-446655440002', true),
('Ovo Frito', 'Ovo frito na chapa', 2.50, 'e50e8400-e29b-41d4-a716-446655440002', true),
('Cebola Caramelizada', 'Cebola doce caramelizada', 3.50, 'e50e8400-e29b-41d4-a716-446655440002', true),
('Molho Especial', 'Nosso molho especial da casa', 1.50, 'e50e8400-e29b-41d4-a716-446655440002', true);
