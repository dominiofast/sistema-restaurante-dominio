-- CONFIGURAÇÃO REAL-TIME PARA WHATSAPP CHAT
-- Habilitar REPLICA IDENTITY FULL para capturar dados completos nas mudanças

-- 1. Configurar whatsapp_messages para real-time
ALTER TABLE public.whatsapp_messages REPLICA IDENTITY FULL;

-- 2. Configurar whatsapp_chats para real-time  
ALTER TABLE public.whatsapp_chats REPLICA IDENTITY FULL;

-- 3. Adicionar as tabelas à publicação supabase_realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_chats;

-- 4. Verificar se as tabelas foram adicionadas corretamente
SELECT 
    schemaname,
    tablename,
    'REAL-TIME HABILITADO' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('whatsapp_messages', 'whatsapp_chats')
ORDER BY tablename;

-- Log da configuração
SELECT '🔔 REAL-TIME HABILITADO PARA WHATSAPP:' as info;
SELECT '• whatsapp_messages - Para mensagens em tempo real' as tabela_1;
SELECT '• whatsapp_chats - Para atualizações de chats' as tabela_2;
SELECT '• REPLICA IDENTITY FULL configurado' as feature_1;
SELECT '• Publicação supabase_realtime atualizada' as feature_2;