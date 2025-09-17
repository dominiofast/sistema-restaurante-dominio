-- Atualizar configuração do agente IA para Domínio Pizzas seguir padrão Quadrata
UPDATE ai_agent_assistants 
SET 
    bot_name = 'RangoBot',
    updated_at = now()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Log da atualização
INSERT INTO ai_conversation_logs (
    company_id,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'SYSTEM',
    'CONFIG_UPDATE',
    'Configuração atualizada para seguir padrão Quadrata - Links limpos e mensagens padronizadas',
    'config_update',
    now()
);