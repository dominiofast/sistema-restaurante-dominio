-- 🚀 CORREÇÃO RÁPIDA: Domínio Pizzas - Ativar modo direto - VERSÃO FINAL
-- Execute este script no SQL Editor do Supabase para corrigir imediatamente

-- ================================
-- PASSO 1: ATIVAR MODO DIRETO PARA DOMÍNIO PIZZAS
-- ================================

-- Remover configuração antiga de assistant se existir
DELETE FROM ai_agent_assistants 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Criar configuração de assistant com modo direto ativo e todos os campos obrigatórios
INSERT INTO ai_agent_assistants (
    company_id,
    bot_name,
    assistant_id,
    cardapio_url,
    produtos_path,
    config_path,
    use_direct_mode,
    is_active,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Assistente Domínio Pizzas',
    'direct_mode',
    'https://dominiopizzas.com.br/cardapio',
    '/produtos/dominiopizzas',
    '/config/dominiopizzas',
    true,
    true,
    NOW(),
    NOW()
);

-- ================================
-- PASSO 2: GARANTIR QUE O AGENTE IA ESTÁ ATIVO
-- ================================

-- Ativar agente IA se não estiver ativo
UPDATE ai_agent_config 
SET 
    is_active = true,
    updated_at = NOW()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- PASSO 3: REMOVER PAUSAS DE IA
-- ================================

-- Remover pausas de IA para todos os chats da Domínio Pizzas
UPDATE whatsapp_chats 
SET 
    ai_paused = false,
    updated_at = NOW()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- PASSO 4: GARANTIR QUE A INTEGRAÇÃO ESTÁ CORRETA
-- ================================

-- Atualizar integração WhatsApp para garantir configuração correta
UPDATE whatsapp_integrations 
SET 
    ia_agent_preset = NULL,
    ia_model = 'gpt-4o-mini',
    ia_temperature = 0.7,
    webhook = 'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/whatsapp-webhook',
    updated_at = NOW()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- PASSO 5: LOG DA CORREÇÃO
-- ================================

-- Log da correção aplicada
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
    'ADMIN',
    'CORREÇÃO RÁPIDA APLICADA: Modo direto ativado, pausas removidas, integração corrigida',
    'emergency_fix',
    NOW()
);

-- ================================
-- VERIFICAÇÕES FINAIS
-- ================================

-- Verificar se o modo direto está ativo
SELECT 
    'MODO DIRETO ATIVO' as status,
    company_id,
    bot_name,
    produtos_path,
    use_direct_mode,
    is_active,
    created_at
FROM ai_agent_assistants 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Verificar se o agente IA está ativo
SELECT 
    'AGENTE IA ATIVO' as status,
    company_id,
    is_active,
    agent_name,
    updated_at
FROM ai_agent_config 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Verificar se não há pausas
SELECT 
    'PAUSAS REMOVIDAS' as status,
    COUNT(*) as total_chats,
    COUNT(CASE WHEN ai_paused = true THEN 1 END) as chats_pausados
FROM whatsapp_chats 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Verificar integração
SELECT 
    'INTEGRAÇÃO CORRIGIDA' as status,
    instance_key,
    ia_agent_preset,
    webhook,
    updated_at
FROM whatsapp_integrations 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';
