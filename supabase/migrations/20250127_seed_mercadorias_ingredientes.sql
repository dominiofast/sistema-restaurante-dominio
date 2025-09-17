-- Script para inserir dados padrão de Mercadorias/Ingredientes
-- Data: 2025-01-27
-- Descrição: Ingredientes básicos para pizzarias e restaurantes

-- Função para inserir mercadorias para todas as empresas ativas
DO $$
DECLARE
    company_record RECORD;
BEGIN
    -- Loop através de todas as empresas ativas
    FOR company_record IN SELECT id, name FROM companies WHERE status = 'active'
    LOOP
        -- Inserir ingredientes básicos para cada empresa
        INSERT INTO mercadorias_ingredientes (
            company_id, nome, descricao, unidade_medida, categoria, 
            preco_unitario, estoque_atual, estoque_minimo, observacoes
        ) VALUES 
        
        -- === MASSAS E FARINHAS ===
        (company_record.id, 'Farinha de Trigo Tipo 1', 'Farinha de trigo especial para pizza', 'kg', 'Farinhas e Massas', 3.50, 50.0, 10.0, 'Ideal para massa de pizza'),
        (company_record.id, 'Farinha Semolina', 'Farinha de semolina para massa especial', 'kg', 'Farinhas e Massas', 8.90, 20.0, 5.0, 'Para massas premium'),
        (company_record.id, 'Fermento Biológico Seco', 'Fermento para crescimento da massa', 'g', 'Farinhas e Massas', 0.15, 500.0, 100.0, 'Conservar em local seco'),
        
        -- === MOLHOS E BASES ===
        (company_record.id, 'Molho de Tomate Pelado', 'Tomate pelado italiano para molho', 'kg', 'Molhos e Bases', 8.00, 30.0, 8.0, 'Base para molho de pizza'),
        (company_record.id, 'Azeite Extra Virgem', 'Azeite de oliva extra virgem', 'L', 'Óleos e Gorduras', 25.00, 10.0, 3.0, 'Para finalizar pizzas'),
        (company_record.id, 'Orégano Seco', 'Orégano desidratado', 'g', 'Temperos e Condimentos', 0.08, 200.0, 50.0, 'Tempero clássico'),
        (company_record.id, 'Manjericão Fresco', 'Folhas frescas de manjericão', 'maço', 'Temperos e Condimentos', 3.50, 15.0, 3.0, 'Usar rapidamente'),
        (company_record.id, 'Alho', 'Alho fresco para temperar', 'kg', 'Temperos e Condimentos', 12.00, 5.0, 1.0, 'Indispensável na cozinha'),
        
        -- === QUEIJOS E LATICÍNIOS ===
        (company_record.id, 'Mussarela Fatiada', 'Queijo mussarela fatiado', 'kg', 'Laticínios', 25.00, 40.0, 10.0, 'Principal queijo das pizzas'),
        (company_record.id, 'Parmesão Ralado', 'Queijo parmesão ralado fino', 'kg', 'Laticínios', 45.00, 15.0, 3.0, 'Para finalizar'),
        (company_record.id, 'Gorgonzola', 'Queijo gorgonzola cremoso', 'kg', 'Laticínios', 38.00, 8.0, 2.0, 'Queijo especial'),
        (company_record.id, 'Catupiry', 'Requeijão cremoso Catupiry', 'kg', 'Laticínios', 28.00, 12.0, 3.0, 'Marca registrada'),
        (company_record.id, 'Ricota', 'Queijo ricota fresco', 'kg', 'Laticínios', 18.00, 10.0, 2.0, 'Para pizzas brancas'),
        
        -- === CARNES E PROTEÍNAS ===
        (company_record.id, 'Calabresa Defumada', 'Linguiça calabresa fatiada', 'kg', 'Carnes', 22.00, 20.0, 5.0, 'Clássico das pizzas'),
        (company_record.id, 'Presunto Parma', 'Presunto parma importado', 'kg', 'Carnes', 85.00, 5.0, 1.0, 'Produto premium'),
        (company_record.id, 'Bacon em Cubos', 'Bacon cortado em cubos', 'kg', 'Carnes', 32.00, 15.0, 3.0, 'Defumado especial'),
        (company_record.id, 'Peito de Peru Defumado', 'Peito de peru fatiado', 'kg', 'Carnes', 28.00, 8.0, 2.0, 'Opção mais saudável'),
        (company_record.id, 'Frango Desfiado', 'Peito de frango cozido e desfiado', 'kg', 'Aves', 18.00, 12.0, 3.0, 'Temperar antes de usar'),
        
        -- === FRUTOS DO MAR ===
        (company_record.id, 'Camarão Descascado', 'Camarão médio limpo', 'kg', 'Frutos do Mar', 65.00, 8.0, 2.0, 'Manter congelado'),
        (company_record.id, 'Atum em Latas', 'Atum sólido em água', 'unidade', 'Frutos do Mar', 8.50, 25.0, 5.0, 'Escorrer antes de usar'),
        
        -- === VEGETAIS E VERDURAS ===
        (company_record.id, 'Tomate Italiano', 'Tomate alongado para pizza', 'kg', 'Legumes e Verduras', 8.00, 20.0, 5.0, 'Cortar em rodelas'),
        (company_record.id, 'Cebola Roxa', 'Cebola roxa fatiada', 'kg', 'Legumes e Verduras', 4.50, 15.0, 3.0, 'Sabor mais suave'),
        (company_record.id, 'Pimentão Verde', 'Pimentão verde em tiras', 'kg', 'Legumes e Verduras', 6.00, 10.0, 2.0, 'Cortar em tiras'),
        (company_record.id, 'Champignon Fatiado', 'Cogumelos champignon em conserva', 'kg', 'Legumes e Verduras', 12.00, 15.0, 3.0, 'Escorrer bem'),
        (company_record.id, 'Azeitona Preta', 'Azeitona preta sem caroço', 'kg', 'Legumes e Verduras', 18.00, 12.0, 2.0, 'Enxaguar antes de usar'),
        (company_record.id, 'Rúcula Fresca', 'Folhas de rúcula selecionada', 'maço', 'Legumes e Verduras', 4.50, 20.0, 5.0, 'Lavar bem antes de usar'),
        (company_record.id, 'Milho em Conserva', 'Grãos de milho doce', 'kg', 'Legumes e Verduras', 7.50, 18.0, 4.0, 'Escorrer o líquido'),
        
        -- === FRUTAS ===
        (company_record.id, 'Abacaxi em Fatias', 'Abacaxi descascado em fatias', 'kg', 'Frutas', 12.00, 8.0, 2.0, 'Para pizzas doces'),
        (company_record.id, 'Banana Nanica', 'Banana madura para doces', 'kg', 'Frutas', 6.00, 10.0, 2.0, 'Para pizzas de sobremesa'),
        
        -- === DOCES E SOBREMESAS ===
        (company_record.id, 'Chocolate ao Leite', 'Chocolate ao leite em barra', 'kg', 'Doces e Sobremesas', 28.00, 5.0, 1.0, 'Derreter em banho-maria'),
        (company_record.id, 'Leite Condensado', 'Leite condensado tradicional', 'kg', 'Doces e Sobremesas', 8.50, 12.0, 3.0, 'Para pizzas doces'),
        (company_record.id, 'Açúcar Cristal', 'Açúcar cristal refinado', 'kg', 'Doces e Sobremesas', 4.50, 25.0, 5.0, 'Uso geral'),
        
        -- === ÓLEOS E GORDURAS ===
        (company_record.id, 'Óleo de Soja', 'Óleo de soja refinado', 'L', 'Óleos e Gorduras', 8.50, 20.0, 5.0, 'Para refogar'),
        (company_record.id, 'Azeite Composto', 'Azeite misto para uso geral', 'L', 'Óleos e Gorduras', 12.00, 15.0, 3.0, 'Sabor suave'),
        
        -- === CONSERVAS ===
        (company_record.id, 'Palmito em Conserva', 'Palmito inteiro em conserva', 'kg', 'Conservas', 15.00, 10.0, 2.0, 'Cortar em rodelas'),
        (company_record.id, 'Ervilha em Conserva', 'Ervilha verde em conserva', 'kg', 'Conservas', 6.50, 15.0, 3.0, 'Escorrer bem'),
        
        -- === BEBIDAS (ingredientes para preparo) ===
        (company_record.id, 'Água Mineral', 'Água mineral natural', 'L', 'Bebidas', 2.50, 100.0, 20.0, 'Para preparo de massas'),
        (company_record.id, 'Sal Refinado', 'Sal refinado especial', 'kg', 'Temperos e Condimentos', 3.00, 10.0, 2.0, 'Uso geral na cozinha'),
        
        -- === EMBALAGENS ===
        (company_record.id, 'Caixa Pizza 35cm', 'Caixa de papelão para pizza grande', 'unidade', 'Embalagens', 2.80, 200.0, 50.0, 'Padrão pizzaria'),
        (company_record.id, 'Caixa Pizza 30cm', 'Caixa de papelão para pizza média', 'unidade', 'Embalagens', 2.20, 300.0, 75.0, 'Tamanho médio'),
        (company_record.id, 'Guardanapo Personalizado', 'Guardanapo com logo da empresa', 'unidade', 'Embalagens', 0.05, 5000.0, 1000.0, 'Identidade visual');
        
        RAISE NOTICE 'Mercadorias inseridas para empresa: %', company_record.name;
        
    END LOOP;
END $$; 