-- ========================================
-- DEBUG: IDENTIFICAR EXATAMENTE O QUE ESTÁ ATIVO
-- ========================================

-- 1. VER TODOS OS TRIGGERS ATIVOS NA TABELA PEDIDOS
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement,
    action_condition
FROM information_schema.triggers 
WHERE event_object_table = 'pedidos'
ORDER BY trigger_name;

-- 2. VER TODAS AS FUNÇÕES QUE CONTÊM "CONFIRMAÇÃO DE PEDIDO"
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_definition ILIKE '%CONFIRMAÇÃO DE PEDIDO%'
AND routine_schema = 'public';

-- 3. FORÇAR REMOÇÃO DE TODAS AS FUNÇÕES QUE GERAM ESSA MENSAGEM
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Buscar e dropar TODAS as funções que contêm a mensagem antiga
    FOR func_record IN
        SELECT routine_name
        FROM information_schema.routines 
        WHERE routine_definition ILIKE '%CONFIRMAÇÃO DE PEDIDO%'
        AND routine_schema = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.routine_name || '() CASCADE';
        RAISE NOTICE 'Removida função: %', func_record.routine_name;
    END LOOP;
END $$;

-- 4. REMOVER ABSOLUTAMENTE TODOS OS TRIGGERS
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN
        SELECT trigger_name
        FROM information_schema.triggers 
        WHERE event_object_table = 'pedidos'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON pedidos CASCADE';
        RAISE NOTICE 'Removido trigger: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- 5. VERIFICAR SE LIMPOU TUDO
SELECT 'TRIGGERS RESTANTES:' as info;
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'pedidos';

SELECT 'FUNÇÕES COM CONFIRMAÇÃO RESTANTES:' as info;
SELECT routine_name FROM information_schema.routines 
WHERE routine_definition ILIKE '%CONFIRMAÇÃO DE PEDIDO%' AND routine_schema = 'public';
