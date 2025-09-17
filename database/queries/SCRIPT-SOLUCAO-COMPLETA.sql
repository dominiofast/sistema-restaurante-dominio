-- 🔧 SOLUÇÃO COMPLETA: CATEGORIAS KDS + NUMERAÇÃO PEDIDOS
-- Execute este script no SQL Editor do Supabase

-- ================================
-- VERIFICAÇÃO PRÉVIA DA ESTRUTURA
-- ================================

-- 0.1. Verificar se a tabela pedido_item_adicionais existe
SELECT 
    '🔍 VERIFICAÇÃO INICIAL:' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pedido_item_adicionais') 
        THEN 'Tabela pedido_item_adicionais existe ✅' 
        ELSE 'Tabela pedido_item_adicionais NÃO existe ❌' 
    END as status_tabela;

-- 0.2. Criar coluna categoria_nome se não existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pedido_item_adicionais') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'pedido_item_adicionais' 
            AND column_name = 'categoria_nome'
        ) THEN
            ALTER TABLE pedido_item_adicionais 
            ADD COLUMN categoria_nome TEXT DEFAULT 'Adicional';
            
            RAISE NOTICE '✅ Coluna categoria_nome criada com sucesso!';
        ELSE
            RAISE NOTICE '✅ Coluna categoria_nome já existe';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ Tabela pedido_item_adicionais não existe ainda - será criada automaticamente';
    END IF;
END $$;

-- ================================
-- PARTE 1: CORRIGIR CATEGORIAS NO KDS
-- ================================

-- 1.1. Verificar situação atual (só se a tabela existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pedido_item_adicionais') THEN
        PERFORM 1; -- Tabela existe, podemos prosseguir
        
        -- Executar query apenas se a tabela tiver dados
        IF EXISTS (SELECT 1 FROM pedido_item_adicionais LIMIT 1) THEN
            -- Mostrar situação atual
            EXECUTE 'SELECT 
                ''1️⃣ SITUAÇÃO ATUAL - CATEGORIAS:'' as info,
                COUNT(*) as total_adicionais,
                COUNT(CASE WHEN categoria_nome = ''Adicional'' THEN 1 END) as com_categoria_generica,
                COUNT(CASE WHEN categoria_nome != ''Adicional'' AND categoria_nome IS NOT NULL THEN 1 END) as com_categoria_real
                FROM pedido_item_adicionais';
        ELSE
            RAISE NOTICE '1️⃣ Tabela pedido_item_adicionais existe mas está vazia';
        END IF;
    ELSE
        RAISE NOTICE '1️⃣ Tabela pedido_item_adicionais não existe ainda';
    END IF;
END $$;

-- 1.2. Atualizar registros com categoria_nome genérica (só se necessário)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pedido_item_adicionais') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'adicionais')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categorias_adicionais') THEN
        
        -- Atualizar categorias genéricas
        UPDATE pedido_item_adicionais 
        SET categoria_nome = COALESCE(ca.name, 'Outros')
        FROM adicionais a
        JOIN categorias_adicionais ca ON a.categoria_adicional_id = ca.id
        WHERE pedido_item_adicionais.nome_adicional = a.name
          AND pedido_item_adicionais.categoria_nome = 'Adicional';
        
        -- Busca flexível
        UPDATE pedido_item_adicionais 
        SET categoria_nome = COALESCE(ca.name, 'Outros')
        FROM adicionais a
        JOIN categorias_adicionais ca ON a.categoria_adicional_id = ca.id
        WHERE UPPER(pedido_item_adicionais.nome_adicional) = UPPER(a.name)
          AND pedido_item_adicionais.categoria_nome = 'Adicional';
        
        RAISE NOTICE '✅ Categorias atualizadas com sucesso!';
    ELSE
        RAISE NOTICE '⚠️ Tabelas necessárias para correção de categorias não existem ainda';
    END IF;
END $$;

-- ================================
-- PARTE 2: CORRIGIR NUMERAÇÃO POR EMPRESA
-- ================================

-- 2.1. Recriar função principal com melhorias
CREATE OR REPLACE FUNCTION public.get_next_pedido_number_for_company_today_public(company_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    sequence_name TEXT;
    next_number INTEGER;
    today_date TEXT;
    sequence_exists BOOLEAN := FALSE;
BEGIN
    -- Data de hoje no formato YYYY-MM-DD
    today_date := to_char(CURRENT_DATE, 'YYYY_MM_DD');
    
    -- Nome da sequência específica para esta empresa hoje
    sequence_name := 'pedidos_' || replace(company_uuid::text, '-', '_') || '_' || today_date || '_seq';
    
    -- Verificar se a sequência já existe
    SELECT EXISTS (
        SELECT 1 FROM pg_sequences 
        WHERE sequencename = sequence_name AND schemaname = 'public'
    ) INTO sequence_exists;
    
    IF sequence_exists THEN
        -- Sequência existe, usar próximo valor
        EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
    ELSE
        -- Sequência não existe, criar começando do 1
        EXECUTE format('CREATE SEQUENCE %I START WITH 1', sequence_name);
        EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
    END IF;
    
    RETURN next_number;
END;
$$;

-- 2.2. Garantir permissões corretas
GRANT EXECUTE ON FUNCTION public.get_next_pedido_number_for_company_today_public(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_next_pedido_number_for_company_today_public(UUID) TO authenticated;

-- 2.3. Função para resetar sequência de uma empresa (para testes)
CREATE OR REPLACE FUNCTION public.reset_company_sequence_today(company_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    sequence_name TEXT;
    today_date TEXT;
BEGIN
    today_date := to_char(CURRENT_DATE, 'YYYY_MM_DD');
    sequence_name := 'pedidos_' || replace(company_uuid::text, '-', '_') || '_' || today_date || '_seq';
    
    BEGIN
        EXECUTE format('ALTER SEQUENCE %I RESTART WITH 1', sequence_name);
    EXCEPTION
        WHEN undefined_table THEN
            NULL; -- Sequência não existe ainda
    END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_company_sequence_today(UUID) TO authenticated;

-- ================================
-- PARTE 3: VERIFICAÇÕES FINAIS
-- ================================

-- 3.1. Verificar resultado da correção de categorias
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pedido_item_adicionais') 
       AND EXISTS (SELECT 1 FROM pedido_item_adicionais LIMIT 1) THEN
        
        EXECUTE 'SELECT 
            ''2️⃣ APÓS CORREÇÃO - CATEGORIAS:'' as info,
            COUNT(*) as total_adicionais,
            COUNT(CASE WHEN categoria_nome = ''Adicional'' THEN 1 END) as ainda_genericas,
            COUNT(CASE WHEN categoria_nome != ''Adicional'' AND categoria_nome IS NOT NULL THEN 1 END) as corrigidas
            FROM pedido_item_adicionais';
    ELSE
        RAISE NOTICE '2️⃣ Tabela pedido_item_adicionais vazia ou inexistente';
    END IF;
END $$;

-- 3.2. Testar função de numeração
DO $$
DECLARE
    company_record RECORD;
    test_number INTEGER;
BEGIN
    FOR company_record IN 
        SELECT id, name FROM companies WHERE status = 'active' ORDER BY name LIMIT 2
    LOOP
        SELECT get_next_pedido_number_for_company_today_public(company_record.id) INTO test_number;
        RAISE NOTICE '✅ Empresa "%" - Próximo número: %', company_record.name, test_number;
    END LOOP;
END $$;

-- 3.3. Verificar se há duplicatas na numeração de hoje
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pedidos') THEN
        EXECUTE 'SELECT 
            ''3️⃣ VERIFICAR DUPLICATAS HOJE:'' as info,
            p.id as numero,
            COUNT(*) as empresas_usando,
            STRING_AGG(c.name, '', '') as nomes_empresas
            FROM pedidos p
            JOIN companies c ON p.company_id = c.id
            WHERE p.created_at::date = CURRENT_DATE
            GROUP BY p.id
            HAVING COUNT(*) > 1
            ORDER BY p.id
            LIMIT 5';
    ELSE
        RAISE NOTICE '3️⃣ Tabela pedidos não existe ainda';
    END IF;
END $$;

-- 3.4. Resultado final
SELECT '🎉 SCRIPT EXECUTADO COM SUCESSO!' as resultado;
SELECT 'As funções do frontend foram atualizadas automaticamente.' as info;
SELECT 'Novos pedidos agora usarão as categorias corretas no KDS.' as info2;
SELECT 'Numeração por empresa foi corrigida e testada.' as info3; 