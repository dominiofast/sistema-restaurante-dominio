-- Script para inserir receitas básicas de pizzaria
-- Data: 2025-01-27
-- Descrição: Receitas fundamentais para pizzarias

-- Função para inserir receitas para todas as empresas ativas
DO $$
DECLARE
    company_record RECORD;
    massa_pizza_id UUID;
    molho_base_id UUID;
    pizza_margherita_id UUID;
    pizza_calabresa_id UUID;
BEGIN
    -- Loop através de todas as empresas ativas
    FOR company_record IN SELECT id, name FROM companies WHERE status = 'active'
    LOOP
        RAISE NOTICE 'Inserindo receitas para empresa: %', company_record.name;
        
        -- === RECEITA 1: MASSA DE PIZZA TRADICIONAL ===
        INSERT INTO receitas_fichas_tecnicas (
            company_id, nome, descricao, categoria, tempo_preparo, rendimento, 
            unidade_rendimento, modo_preparo, observacoes, custo_total, 
            preco_venda_sugerido, margem_lucro
        ) VALUES (
            company_record.id,
            'Massa de Pizza Tradicional',
            'Massa clássica italiana para pizza',
            'Massas',
            120,
            8,
            'unidades',
            E'1. Dissolva o fermento em água morna (35°C)\n2. Em uma tigela, misture a farinha com o sal\n3. Faça um buraco no centro e adicione a água com fermento\n4. Adicione o azeite e misture bem\n5. Sove a massa por 10 minutos até ficar lisa\n6. Deixe descansar por 1 hora em local morno\n7. Divida em 8 porções de 150g cada\n8. Modele as bolinhas e deixe descansar mais 30 min\n9. Abra com as mãos ou rolo, sempre do centro para fora',
            'Massa deve ficar elástica e macia. Não adicionar muita farinha ao abrir.',
            12.50,
            25.00,
            100.00
        ) RETURNING id INTO massa_pizza_id;
        
        -- === RECEITA 2: MOLHO BASE PARA PIZZA ===
        INSERT INTO receitas_fichas_tecnicas (
            company_id, nome, descricao, categoria, tempo_preparo, rendimento, 
            unidade_rendimento, modo_preparo, observacoes, custo_total, 
            preco_venda_sugerido, margem_lucro
        ) VALUES (
            company_record.id,
            'Molho Base Para Pizza',
            'Molho de tomate temperado para base das pizzas',
            'Molhos e Bases',
            45,
            2,
            'kg',
            E'1. Escorra bem os tomates pelados e amasse com as mãos\n2. Aqueça o azeite em uma panela\n3. Refogue o alho picado até dourar\n4. Adicione os tomates amassados\n5. Tempere com sal, orégano e manjericão\n6. Cozinhe em fogo baixo por 30 minutos mexendo ocasionalmente\n7. Ajuste o tempero a gosto\n8. Deixe esfriar antes de usar\n9. Conserve na geladeira por até 5 dias',
            'Molho não deve ficar muito líquido. Se necessário, cozinhe mais para reduzir.',
            8.20,
            18.00,
            119.51
        ) RETURNING id INTO molho_base_id;
        
        -- === RECEITA 3: PIZZA MARGHERITA ===
        INSERT INTO receitas_fichas_tecnicas (
            company_id, nome, descricao, categoria, tempo_preparo, rendimento, 
            unidade_rendimento, modo_preparo, observacoes, custo_total, 
            preco_venda_sugerido, margem_lucro
        ) VALUES (
            company_record.id,
            'Pizza Margherita',
            'Clássica pizza italiana com molho, mussarela e manjericão',
            'Pizzas Tradicionais',
            15,
            1,
            'unidades',
            E'1. Pré-aqueça o forno à temperatura máxima (250°C)\n2. Abra a massa em formato circular\n3. Coloque sobre a forma ou pedra refratária\n4. Espalhe 80g do molho base uniformemente\n5. Distribua a mussarela fatiada por toda pizza\n6. Leve ao forno por 8-12 minutos\n7. Retire quando as bordas estiverem douradas\n8. Adicione folhas frescas de manjericão\n9. Regue com fio de azeite extra virgem\n10. Sirva imediatamente',
            'Pizza deve ter bordas crocantes e centro macio. Manjericão sempre fresco no final.',
            8.75,
            24.90,
            184.57
        ) RETURNING id INTO pizza_margherita_id;
        
        -- === RECEITA 4: PIZZA CALABRESA ===
        INSERT INTO receitas_fichas_tecnicas (
            company_id, nome, descricao, categoria, tempo_preparo, rendimento, 
            unidade_rendimento, modo_preparo, observacoes, custo_total, 
            preco_venda_sugerido, margem_lucro
        ) VALUES (
            company_record.id,
            'Pizza Calabresa',
            'Pizza tradicional com calabresa, cebola e azeitona',
            'Pizzas Tradicionais',
            18,
            1,
            'unidades',
            E'1. Pré-aqueça o forno à temperatura máxima (250°C)\n2. Abra a massa em formato circular\n3. Espalhe 80g do molho base\n4. Distribua a mussarela fatiada\n5. Adicione as fatias de calabresa\n6. Espalhe a cebola roxa em fatias finas\n7. Decore com azeitonas pretas\n8. Leve ao forno por 10-14 minutos\n9. Retire quando dourada\n10. Polvilhe orégano seco\n11. Sirva quente',
            'Calabresa deve ser de boa qualidade. Cebola roxa dá sabor mais suave.',
            11.20,
            28.90,
            158.04
        ) RETURNING id INTO pizza_calabresa_id;
        
        -- === RECEITA 5: MOLHO BRANCO ===
        INSERT INTO receitas_fichas_tecnicas (
            company_id, nome, descricao, categoria, tempo_preparo, rendimento, 
            unidade_rendimento, modo_preparo, observacoes, custo_total, 
            preco_venda_sugerido, margem_lucro
        ) VALUES (
            company_record.id,
            'Molho Branco Para Pizza',
            'Molho cremoso à base de ricota e catupiry',
            'Molhos e Bases',
            20,
            1.5,
            'kg',
            E'1. Amasse bem a ricota até ficar cremosa\n2. Misture com o catupiry em temperatura ambiente\n3. Adicione uma pitada de sal e pimenta branca\n4. Acrescente alho bem picadinho (opcional)\n5. Misture até obter consistência homogênea\n6. Prove e ajuste temperos\n7. Use imediatamente ou conserve por até 3 dias\n8. Aplicar camada fina sobre a massa',
            'Não levar ao fogo. Molho deve ser usado frio sobre a massa.',
            22.50,
            45.00,
            100.00
        );
        
        -- === RECEITA 6: PIZZA 4 QUEIJOS ===
        INSERT INTO receitas_fichas_tecnicas (
            company_id, nome, descricao, categoria, tempo_preparo, rendimento, 
            unidade_rendimento, modo_preparo, observacoes, custo_total, 
            preco_venda_sugerido, margem_lucro
        ) VALUES (
            company_record.id,
            'Pizza 4 Queijos',
            'Pizza especial com mussarela, gorgonzola, parmesão e catupiry',
            'Pizzas Especiais',
            16,
            1,
            'unidades',
            E'1. Pré-aqueça o forno à temperatura máxima\n2. Abra a massa deixando bordas mais grossas\n3. Espalhe uma camada fina de molho branco\n4. Distribua a mussarela cobrindo toda base\n5. Adicione pedaços pequenos de gorgonzola\n6. Espalhe colheradas de catupiry\n7. Finalize polvilhando parmesão ralado\n8. Leve ao forno por 12-15 minutos\n9. Retire quando queijos estiverem derretidos\n10. Deixe descansar 2 minutos antes de cortar',
            'Queijos devem estar em temperatura ambiente. Não exagerar no gorgonzola.',
            18.50,
            42.90,
            131.89
        );
        
        -- === RECEITA 7: BORDA RECHEADA ===
        INSERT INTO receitas_fichas_tecnicas (
            company_id, nome, descricao, categoria, tempo_preparo, rendimento, 
            unidade_rendimento, modo_preparo, observacoes, custo_total, 
            preco_venda_sugerido, margem_lucro
        ) VALUES (
            company_record.id,
            'Borda Recheada Tradicional',
            'Técnica para fazer borda recheada com catupiry',
            'Técnicas Especiais',
            10,
            1,
            'unidades',
            E'1. Abra a massa deixando 3cm de borda extra\n2. Faça pequenas bolinhas de catupiry (10g cada)\n3. Coloque as bolinhas na borda da massa\n4. Dobre a borda sobre o recheio\n5. Aperte bem as emendas para selar\n6. Pincele a borda com azeite\n7. Polvilhe orégano sobre a borda\n8. Adicione os ingredientes no centro\n9. Asse normalmente\n10. A borda fica dourada e cremosa por dentro',
            'Selar bem a borda para não vazar. Catupiry deve estar firme.',
            3.50,
            8.00,
            128.57
        );
        
        RAISE NOTICE 'Receitas básicas inseridas com sucesso para: %', company_record.name;
        
    END LOOP;
END $$; 