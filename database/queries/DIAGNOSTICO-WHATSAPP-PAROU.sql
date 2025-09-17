-- =====================================================
-- DIAGNÓSTICO: POR QUE WHATSAPP PAROU DE FUNCIONAR
-- =====================================================

-- 1. VERIFICAR SE O TRIGGER FOI CRIADO
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    CASE 
        WHEN t.tgenabled = 'O' THEN '✅ ATIVO'
        WHEN t.tgenabled = 'D' THEN '❌ DESABILITADO'
        ELSE '⚠️ STATUS: ' || t.tgenabled::text
    END as status,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE c.relname = 'pedido_itens'
AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 2. VERIFICAR SE A FUNÇÃO EXISTE
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'send_whatsapp_notification_after_items';

-- 3. VERIFICAR INTEGRAÇÕES WHATSAPP ATIVAS
SELECT 
    id,
    company_id,
    purpose,
    host,
    instance_key,
    created_at,
    updated_at
FROM whatsapp_integrations
WHERE purpose = 'orders'
ORDER BY created_at DESC;

-- 4. VERIFICAR ÚLTIMOS PEDIDOS CRIADOS
SELECT 
    id,
    numero_pedido,
    nome as cliente,
    telefone,
    tipo,
    total,
    forma_pagamento,
    created_at
FROM pedidos
ORDER BY created_at DESC
LIMIT 5;

-- 5. VERIFICAR ÚLTIMOS ITENS INSERIDOS
SELECT 
    pi.id,
    pi.pedido_id,
    pi.produto_id,
    pi.quantidade,
    pi.valor_total,
    pi.created_at,
    p.nome as produto_nome,
    ped.numero_pedido
FROM pedido_itens pi
JOIN produtos p ON p.id = pi.produto_id
JOIN pedidos ped ON ped.id = pi.pedido_id
ORDER BY pi.created_at DESC
LIMIT 10;

-- 6. TESTAR A FUNÇÃO MANUALMENTE (substitua o ID do pedido)
-- Pegar o último pedido criado
WITH ultimo_pedido AS (
    SELECT id, company_id 
    FROM pedidos 
    ORDER BY created_at DESC 
    LIMIT 1
)
SELECT 
    'Último pedido para teste:' as info,
    id as pedido_id,
    company_id
FROM ultimo_pedido;

-- 7. VERIFICAR SE HÁ ERROS NO LOG (se possível)
-- Esta query pode não funcionar dependendo das permissões
SELECT 
    'Verificar logs do Supabase para erros recentes' as info;

-- 8. TESTE SIMPLES: VERIFICAR SE A FUNÇÃO PODE SER EXECUTADA
-- (Vamos criar uma versão de teste)
CREATE OR REPLACE FUNCTION test_whatsapp_function()
RETURNS TEXT AS $$
DECLARE
    v_test_result TEXT;
BEGIN
    -- Testar se conseguimos acessar as tabelas
    SELECT 'OK - Tabelas acessíveis' INTO v_test_result
    FROM pedidos
    LIMIT 1;
    
    RETURN v_test_result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'ERRO: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Executar o teste
SELECT test_whatsapp_function() as teste_acesso;

-- 9. VERIFICAR SE A EXTENSÃO HTTP ESTÁ FUNCIONANDO
SELECT 
    extname,
    extversion
FROM pg_extension
WHERE extname = 'http';

-- 10. SUGESTÃO DE CORREÇÃO: RECRIAR TRIGGER SIMPLES
-- Se tudo estiver OK mas não funcionar, vamos recriar um trigger mais simples
SELECT 
    'Se o problema persistir, execute o script de correção:' as sugestao,
    'CORRIGIR-TRIGGER-SIMPLES.sql' as proximo_script;
