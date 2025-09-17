-- 🚀 FORÇAR PROMPT PERSONALIZADO NO MODO DIRETO - Domínio Pizzas
-- Garantir que o modo direto use o prompt personalizado

-- ================================
-- PASSO 1: GARANTIR QUE O PROMPT ESTÁ CORRETO
-- ================================

-- Atualizar o prompt personalizado para ser mais específico
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

-- Reabilitar modo direto
UPDATE ai_agent_assistants 
SET 
    use_direct_mode = true,
    is_active = true,
    updated_at = NOW()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- PASSO 3: GARANTIR QUE O AGENTE ESTÁ CONFIGURADO
-- ================================

-- Configurar agente IA
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
-- PASSO 4: LIMPAR LOGS ANTIGOS
-- ================================

-- Limpar logs antigos para evitar conflitos
DELETE FROM ai_conversation_logs 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001' 
AND created_at < NOW() - INTERVAL '1 hour';

-- ================================
-- PASSO 5: LOG DA CORREÇÃO
-- ================================

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
    'CORREÇÃO: Prompt personalizado forçado no modo direto',
    'force_prompt_direct_mode',
    NOW()
);

-- ================================
-- VERIFICAÇÕES FINAIS
-- ================================

-- Verificar prompt personalizado
SELECT 
    'PROMPT PERSONALIZADO' as status,
    agent_slug,
    template,
    vars,
    version,
    updated_at
FROM ai_agent_prompts 
WHERE agent_slug = 'dominiopizzas';

-- Verificar modo direto
SELECT 
    'MODO DIRETO ATIVO' as status,
    company_id,
    bot_name,
    assistant_id,
    use_direct_mode,
    is_active,
    updated_at
FROM ai_agent_assistants 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Verificar agente IA
SELECT 
    'AGENTE IA CONFIGURADO' as status,
    company_id,
    is_active,
    agent_name,
    personality,
    language,
    welcome_message,
    updated_at
FROM ai_agent_config 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

