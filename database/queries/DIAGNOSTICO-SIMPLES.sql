-- DIAGNÓSTICO SIMPLES - PASSO A PASSO
-- Execute uma consulta por vez no SQL Editor

-- 1. VERIFICAR SE A TABELA PEDIDOS EXISTE
SELECT COUNT(*) as total_pedidos FROM pedidos;

-- 2. VERIFICAR TRIGGERS (uma consulta mais simples)
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'pedidos';

-- 3. VERIFICAR FUNÇÕES DE NOTIFICAÇÃO
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE '%notify%';

-- 4. VERIFICAR WHATSAPP INTEGRATIONS
SELECT COUNT(*) as total_integracoes FROM whatsapp_integrations;

-- 5. VERIFICAR LOGS
SELECT COUNT(*) as total_logs FROM ai_conversation_logs;
