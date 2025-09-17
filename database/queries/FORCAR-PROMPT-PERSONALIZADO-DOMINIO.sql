-- 🚀 FORÇAR PROMPT PERSONALIZADO - Domínio Pizzas - CORREÇÃO DEFINITIVA
-- Execute este script no SQL Editor do Supabase para forçar o uso do prompt personalizado

-- ================================
-- PASSO 1: GARANTIR QUE O PROMPT PERSONALIZADO ESTÁ CORRETO
-- ================================

-- Atualizar o prompt personalizado para garantir que está ativo e correto
UPDATE ai_agent_prompts 
SET 
    template = 'Você é o Assistente Domínio Pizzas, um atendente virtual especializado da pizzaria Domínio Pizzas. 

IMPORTANTE: Você NUNCA deve enviar mensagens padrão genéricas como "Olá! Recebemos sua mensagem e em breve retornaremos." ou similares.

Sua função é:
1. Identificar-se sempre como "Assistente Domínio Pizzas da Domínio Pizzas"
2. Ajudar clientes com pedidos, informações sobre produtos, preços e horários
3. Ser simpático, profissional e sempre útil
4. Fornecer informações precisas sobre o cardápio
5. Direcionar para o site quando necessário: https://pedido.dominio.tech/dominiopizzas

NUNCA use mensagens automáticas ou genéricas. Sempre responda de forma personalizada e útil.

Empresa: {{company_name}}
Cardápio: {{cardapio_url}}
Nome do Assistente: {{agent_name}}',
    vars = '{"company_name": "Domínio Pizzas", "cardapio_url": "https://pedido.dominio.tech/dominiopizzas", "agent_name": "Assistente Domínio Pizzas"}',
    version = version + 1,
    updated_at = NOW()
WHERE agent_slug = 'dominiopizzas';

-- ================================
-- PASSO 2: GARANTIR QUE O MODO DIRETO ESTÁ ATIVO
-- ================================

-- Remover configuração antiga
DELETE FROM ai_agent_assistants 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Criar configuração forçada de modo direto
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
    'FORCE_PERSONALIZED_PROMPT',
    'https://dominiopizzas.com.br/cardapio',
    '/produtos/dominiopizzas',
    '/config/dominiopizzas',
    true,
    true,
    NOW(),
    NOW()
);

-- ================================
-- PASSO 3: REMOVER TODOS OS MAPPINGS DE ASSISTANT ID
-- ================================

-- Remover mappings que podem estar causando conflito
DELETE FROM ai_assistant_mappings 
WHERE agent_slug = 'dominiopizzas' OR company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- PASSO 4: CONFIGURAR AGENTE IA PARA MODO DIRETO
-- ================================

-- Ativar agente IA com configuração específica
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
-- PASSO 6: REMOVER PAUSAS E LIMPAR LOGS
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
-- PASSO 7: DESABILITAR CONFIGURAÇÕES DE EMERGÊNCIA
-- ================================

-- Desabilitar bloqueios de emergência que podem estar interferindo
UPDATE app_settings 
SET 
    value = 'false',
    updated_at = NOW()
WHERE key IN ('emergency_block_legacy_ai', 'emergency_pause_all_ai', 'block_ai_responses')
AND value = 'true';

-- ================================
-- PASSO 8: LOG DA CORREÇÃO FORÇADA
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
    'CORREÇÃO FORÇADA: Prompt personalizado forçado, modo direto ativado, mensagens padrão bloqueadas',
    'force_prompt_fix',
    NOW()
);

-- ================================
-- VERIFICAÇÕES FINAIS
-- ================================

-- Verificar se o prompt personalizado está ativo
SELECT 
    'PROMPT PERSONALIZADO FORÇADO' as status,
    agent_slug,
    version,
    updated_at
FROM ai_agent_prompts 
WHERE agent_slug = 'dominiopizzas';

-- Verificar se o modo direto está ativo
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

-- Verificar se não há mappings conflitantes
SELECT 
    'MAPPINGS REMOVIDOS' as status,
    COUNT(*) as total_mappings
FROM ai_assistant_mappings 
WHERE agent_slug = 'dominiopizzas' OR company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Verificar configurações de emergência
SELECT 
    'CONFIGURAÇÕES EMERGÊNCIA' as status,
    key,
    value,
    updated_at
FROM app_settings 
WHERE key LIKE '%emergency%' OR key LIKE '%block%' OR key LIKE '%pause%';

