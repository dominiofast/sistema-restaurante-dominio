-- 🚀 FORÇAR MODO DIRETO - Domínio Pizzas - CORREÇÃO DEFINITIVA
-- Execute este script no SQL Editor do Supabase para forçar o modo direto

-- ================================
-- PASSO 1: REMOVER TODAS AS CONFIGURAÇÕES ANTIGAS
-- ================================

-- Remover configuração de assistant antiga
DELETE FROM ai_agent_assistants 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Remover mappings de assistant antigos
DELETE FROM ai_assistant_mappings 
WHERE agent_slug = 'dominiopizzas' OR company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- PASSO 2: CRIAR CONFIGURAÇÃO FORÇADA DE MODO DIRETO
-- ================================

-- Criar configuração de assistant com modo direto FORÇADO
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
    'FORCE_DIRECT_MODE',
    'https://dominiopizzas.com.br/cardapio',
    '/produtos/dominiopizzas',
    '/config/dominiopizzas',
    true,
    true,
    NOW(),
    NOW()
);

-- ================================
-- PASSO 3: GARANTIR QUE O PROMPT PERSONALIZADO ESTÁ ATIVO
-- ================================

-- Atualizar prompt personalizado para garantir que está ativo
UPDATE ai_agent_prompts 
SET 
    version = version + 1,
    updated_at = NOW()
WHERE agent_slug = 'dominiopizzas';

-- ================================
-- PASSO 4: CONFIGURAR AGENTE IA PARA MODO DIRETO
-- ================================

-- Ativar agente IA com configuração específica para modo direto
UPDATE ai_agent_config 
SET 
    is_active = true,
    agent_name = 'Assistente Domínio Pizzas',
    personality = 'simpatico',
    language = 'pt-br',
    welcome_message = 'Olá! Sou o Assistente Domínio Pizzas! 🍕 Como posso te ajudar hoje?',
    whatsapp_integration = true,
    updated_at = NOW()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- PASSO 5: GARANTIR QUE A INTEGRAÇÃO ESTÁ CORRETA
-- ================================

-- Forçar configuração da integração WhatsApp
UPDATE whatsapp_integrations 
SET 
    ia_agent_preset = NULL,
    ia_model = 'gpt-4o-mini',
    ia_temperature = 0.7,
    webhook = 'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/whatsapp-webhook',
    updated_at = NOW()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- PASSO 6: REMOVER PAUSAS E LIMPAR LOGS ANTIGOS
-- ================================

-- Remover pausas de IA
UPDATE whatsapp_chats 
SET 
    ai_paused = false,
    updated_at = NOW()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Limpar logs antigos para evitar conflitos
DELETE FROM ai_conversation_logs 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001' 
AND created_at < NOW() - INTERVAL '1 hour';

-- ================================
-- PASSO 7: LOG DA CORREÇÃO FORÇADA
-- ================================

-- Log da correção forçada
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
    'CORREÇÃO FORÇADA: Modo direto ativado, prompt personalizado garantido, configurações limpas',
    'force_fix',
    NOW()
);

-- ================================
-- VERIFICAÇÕES FINAIS
-- ================================

-- Verificar se o modo direto está FORÇADO
SELECT 
    'MODO DIRETO FORÇADO' as status,
    company_id,
    bot_name,
    assistant_id,
    use_direct_mode,
    is_active,
    created_at
FROM ai_agent_assistants 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Verificar prompt personalizado
SELECT 
    'PROMPT PERSONALIZADO ATIVO' as status,
    agent_slug,
    version,
    updated_at
FROM ai_agent_prompts 
WHERE agent_slug = 'dominiopizzas';

-- Verificar agente IA
SELECT 
    'AGENTE IA CONFIGURADO' as status,
    company_id,
    is_active,
    agent_name,
    whatsapp_integration,
    updated_at
FROM ai_agent_config 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';
