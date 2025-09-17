-- Teste básico de funcionamento do banco
SELECT 
    'Banco funcionando' as status,
    NOW() as timestamp;

-- Listar tabelas principais
SELECT 
    'Tabela: ' || tablename as info
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('pedidos', 'whatsapp_integrations', 'ai_conversation_logs')
ORDER BY tablename;