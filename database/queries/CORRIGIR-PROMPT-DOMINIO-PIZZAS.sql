-- 🍕 CORRIGIR PROMPT DOMÍNIO PIZZAS
-- Substituir o template genérico pelo prompt personalizado

-- ================================
-- CORRIGIR PROMPT PERSONALIZADO
-- ================================

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
-- VERIFICAÇÃO
-- ================================

SELECT 
    'PROMPT CORRIGIDO' as status,
    agent_slug,
    template,
    vars,
    version,
    updated_at
FROM ai_agent_prompts 
WHERE agent_slug = 'dominiopizzas';

-- ================================
-- LOG DA CORREÇÃO
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
    'CORREÇÃO: Prompt personalizado da Domínio Pizzas aplicado - substituído template genérico',
    'fix_dominio_pizzas_prompt',
    NOW()
);
