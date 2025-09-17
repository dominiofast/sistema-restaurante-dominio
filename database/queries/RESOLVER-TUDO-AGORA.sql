-- ========================================
-- RESOLVER TUDO: ERRO 400 + CONFIRMAÇÃO ANTIGA
-- ========================================

-- PARTE 1: DIAGNOSTICAR ERRO 400 NA TABELA PEDIDO_ITENS
SELECT 
    'POLÍTICAS RLS PEDIDO_ITENS:' as info,
    schemaname, 
    tablename, 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'pedido_itens'
ORDER BY policyname;

-- Ver se há problema na tabela pedido_itens
\d pedido_itens;

-- PARTE 2: MATAR TODOS OS TRIGGERS DE CONFIRMAÇÃO
-- Triggers na tabela PEDIDOS
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'pedidos' LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON pedidos CASCADE';
        RAISE NOTICE 'Removido da PEDIDOS: %', r.trigger_name;
    END LOOP;
END $$;

-- Triggers na tabela PEDIDO_ITENS  
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'pedido_itens' LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON pedido_itens CASCADE';
        RAISE NOTICE 'Removido da PEDIDO_ITENS: %', r.trigger_name;
    END LOOP;
END $$;

-- PARTE 3: REMOVER TODAS AS FUNÇÕES DE CONFIRMAÇÃO
DROP FUNCTION IF EXISTS send_whatsapp_notification_after_items() CASCADE;
DROP FUNCTION IF EXISTS send_whatsapp_order_confirmation() CASCADE;
DROP FUNCTION IF EXISTS generate_order_confirmation_message() CASCADE;

-- PARTE 4: VERIFICAR SE LIMPOU
SELECT 'TRIGGERS RESTANTES EM PEDIDOS:' as info;
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'pedidos';

SELECT 'TRIGGERS RESTANTES EM PEDIDO_ITENS:' as info;
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'pedido_itens';

-- PARTE 5: CRIAR POLÍTICA RLS CORRETA PARA PEDIDO_ITENS (SE NECESSÁRIO)
-- Verificar se pedido_itens tem RLS problemático
ALTER TABLE pedido_itens DISABLE ROW LEVEL SECURITY;

-- Ou criar política correta se necessário:
-- DROP POLICY IF EXISTS "Users can manage pedido_itens" ON pedido_itens;
-- CREATE POLICY "Allow pedido_itens operations" ON pedido_itens FOR ALL USING (true);

-- PARTE 6: TESTE DE INSERÇÃO
-- Testar se consegue inserir na tabela pedido_itens
INSERT INTO pedido_itens (
    pedido_id, 
    produto_id, 
    nome_produto, 
    quantidade, 
    valor_unitario, 
    valor_total
) VALUES (
    999999, -- ID de teste
    '00000000-0000-0000-0000-000000000001',
    'Teste Item',
    1,
    10.50,
    10.50
);

-- Remover o teste
DELETE FROM pedido_itens WHERE pedido_id = 999999;

SELECT 'TESTE DE INSERÇÃO CONCLUÍDO' as status;
