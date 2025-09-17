-- Atualizar todas as integrações de WhatsApp para usar nosso webhook único
-- Isso centraliza todo o controle de pausa em um só lugar

UPDATE whatsapp_integrations 
SET webhook = 'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/whatsapp-webhook'
WHERE webhook = 'https://pedido.dominio.tech/api/webhook';

-- Adicionar índice para melhorar performance das consultas de pausa
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_pause_lookup 
ON whatsapp_chats (chat_id, company_id, ai_paused);

-- Adicionar índice para logs de conversa por tipo
CREATE INDEX IF NOT EXISTS idx_ai_conversation_logs_message_type 
ON ai_conversation_logs (message_type, created_at DESC);

-- Log da correção aplicada
INSERT INTO ai_conversation_logs (
    company_id,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
) VALUES (
    (SELECT id FROM companies WHERE slug = 'dominiopizzas' LIMIT 1),
    'SYSTEM',
    'ADMIN',
    'CORREÇÃO APLICADA: Todas as integrações WhatsApp agora apontam para o webhook centralizado com controle de pausa robusto',
    'system_fix_applied',
    now()
);