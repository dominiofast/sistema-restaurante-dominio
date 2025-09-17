-- 🔍 DIAGNÓSTICO: TRIGGER NÃO EXECUTOU
-- O pedido foi feito mas não há logs = trigger não disparou

SELECT '🔍 INVESTIGANDO POR QUE O TRIGGER NÃO EXECUTOU' as titulo;

-- 1. VERIFICAR SE O TRIGGER REALMENTE EXISTE E ESTÁ ATIVO
SELECT '1️⃣ STATUS DO TRIGGER:' as secao;

SELECT 
    t.tgname as trigger_name,
    t.tgenabled as habilitado,
    c.relname as tabela,
    'Trigger encontrado' as status
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'pedido_itens'
AND t.tgname = 'trigger_whatsapp_notification'
AND NOT t.tgisinternal;

-- Se não encontrou o trigger
SELECT 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_trigger t
            JOIN pg_class c ON c.oid = t.tgrelid
            WHERE c.relname = 'pedido_itens'
            AND t.tgname = 'trigger_whatsapp_notification'
        ) 
        THEN '❌ TRIGGER NÃO EXISTE! Reinstale o sistema.'
        ELSE '✅ Trigger existe'
    END as status_trigger;

-- 2. VERIFICAR O PEDIDO MAIS RECENTE
SELECT '2️⃣ SEU PEDIDO MAIS RECENTE:' as secao;

SELECT 
    id,
    numero_pedido,
    nome,
    telefone,
    company_id,
    created_at,
    '👆 Este é seu pedido teste' as observacao
FROM pedidos 
ORDER BY created_at DESC 
LIMIT 1;

-- 3. VERIFICAR SE FORAM INSERIDOS ITENS PARA ESTE PEDIDO
SELECT '3️⃣ ITENS DO PEDIDO (ESTES DEVERIAM DISPARAR O TRIGGER):' as secao;

SELECT 
    pi.id,
    pi.pedido_id,
    pi.produto_id,
    pi.nome_produto,
    pi.quantidade,
    pi.created_at,
    '👆 Cada INSERT aqui deveria disparar o trigger' as observacao
FROM pedido_itens pi
WHERE pi.pedido_id = (SELECT id FROM pedidos ORDER BY created_at DESC LIMIT 1)
ORDER BY pi.created_at;

-- 4. VERIFICAR SE HÁ OUTROS TRIGGERS NA TABELA QUE PODEM ESTAR INTERFERINDO
SELECT '4️⃣ TODOS OS TRIGGERS NA TABELA PEDIDO_ITENS:' as secao;

SELECT 
    t.tgname as trigger_name,
    t.tgenabled as habilitado,
    t.tgtype as tipo,
    'Trigger ativo' as status
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'pedido_itens'
AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 5. VERIFICAR SE A FUNÇÃO EXISTE
SELECT '5️⃣ FUNÇÃO DO TRIGGER:' as secao;

SELECT 
    routine_name,
    routine_type,
    'Função existe' as status
FROM information_schema.routines 
WHERE routine_name = 'send_whatsapp_notification_after_items';

-- 6. TESTE MANUAL: INSERIR UM ITEM DE TESTE PARA VER SE O TRIGGER DISPARA
SELECT '6️⃣ VAMOS TESTAR O TRIGGER MANUALMENTE:' as secao;

-- Primeiro, vamos ver se podemos inserir um item de teste
SELECT 
    'ATENÇÃO: Vou inserir um item de teste para disparar o trigger' as aviso,
    'Se você não quiser, pare aqui!' as importante;

-- Inserir item de teste (descomente as linhas abaixo se quiser testar)
/*
DO $$
DECLARE
    pedido_teste_id UUID;
BEGIN
    -- Pegar o pedido mais recente
    SELECT id INTO pedido_teste_id FROM pedidos ORDER BY created_at DESC LIMIT 1;
    
    -- Inserir um item de teste (isso deveria disparar o trigger)
    INSERT INTO pedido_itens (
        pedido_id,
        nome_produto,
        quantidade,
        valor_unitario,
        valor_total,
        created_at
    ) VALUES (
        pedido_teste_id,
        'TESTE TRIGGER WHATSAPP',
        1,
        0.01,
        0.01,
        NOW()
    );
    
    RAISE NOTICE 'Item de teste inserido! Verifique se o trigger executou.';
END $$;
*/

-- 7. VERIFICAR PERMISSÕES E POLÍTICAS RLS
SELECT '7️⃣ VERIFICAR POLÍTICAS RLS:' as secao;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_ativo,
    'Política RLS' as tipo
FROM pg_tables 
WHERE tablename IN ('pedido_itens', 'notification_logs', 'notification_queue')
ORDER BY tablename;

-- 8. DIAGNÓSTICO FINAL
SELECT '8️⃣ POSSÍVEIS CAUSAS:' as secao;

SELECT '• Trigger não foi criado corretamente' as causa_1;
SELECT '• Trigger foi desabilitado' as causa_2;
SELECT '• Itens não foram inseridos na tabela pedido_itens' as causa_3;
SELECT '• Políticas RLS bloqueando a execução' as causa_4;
SELECT '• Erro na função do trigger' as causa_5;
SELECT '• Outro trigger interferindo' as causa_6;

SELECT '💡 PRÓXIMOS PASSOS:' as proximos_passos;
SELECT '1. Verifique se o trigger existe na seção 1' as passo_1;
SELECT '2. Verifique se há itens na seção 3' as passo_2;
SELECT '3. Se não há itens, o problema é no frontend' as passo_3;
SELECT '4. Se há itens mas trigger não executou, reinstale o sistema' as passo_4;