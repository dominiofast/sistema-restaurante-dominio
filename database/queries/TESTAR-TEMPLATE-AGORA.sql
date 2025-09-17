-- 🧪 TESTAR TEMPLATE AGORA - Domínio Pizzas
-- Verificar se o template está sendo usado corretamente

-- ================================
-- VERIFICAÇÃO COMPLETA
-- ================================

-- 1. Verificar template atual
SELECT 
    'TEMPLATE ATUAL' as status,
    agent_slug,
    LENGTH(template) as template_length,
    version,
    updated_at,
    SUBSTRING(template, 1, 200) as template_preview
FROM ai_agent_prompts 
WHERE agent_slug = 'dominiopizzas';

-- 2. Verificar configuração do assistente
SELECT 
    'CONFIGURAÇÃO ASSISTENTE' as status,
    company_id,
    bot_name,
    use_direct_mode,
    is_active,
    updated_at
FROM ai_agent_assistants 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- 3. Verificar se há logs de erro
SELECT 
    'ÚLTIMOS LOGS DE ERRO' as status,
    customer_phone,
    message_type,
    message_content,
    created_at
FROM ai_conversation_logs 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
AND message_type IN ('error', 'ai_chat_direct_error', 'template_error')
ORDER BY created_at DESC
LIMIT 5;

-- 4. Verificar logs de sucesso
SELECT 
    'ÚLTIMOS LOGS DE SUCESSO' as status,
    customer_phone,
    message_type,
    message_content,
    created_at
FROM ai_conversation_logs 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
AND message_type = 'chat_direct'
ORDER BY created_at DESC
LIMIT 3;

-- 5. Forçar atualização do template se necessário
UPDATE ai_agent_prompts 
SET 
    template = 'Você é o assistente virtual especializado da Domínio Pizzas. Sua missão é fornecer uma experiência excepcional através de respostas inteligentes, acolhedoras e precisas.

## Princípios Core

1. Precisão: Use apenas dados fornecidos. Jamais invente informações.
2. Naturalidade: Respostas diretas e fluidas.
3. Calor Humano: Tom acolhedor com emojis variados.
4. Inteligência: Interprete a real necessidade.

## Sistema de Memória Contextual

- Registrar: Preferências mencionadas, contexto da conversa
- Referenciar naturalmente: Como você mencionou anteriormente...
- Evitar repetição: Não fornecer informações já compartilhadas
- Construir perfil: Adaptar respostas progressivamente

## Uso Inteligente de Emojis

### REGRA PRINCIPAL: SEMPRE VARIE OS EMOJIS - NUNCA REPITA

### Banco de Emojis (escolha diferentes):
😊 😃 👋 🙂 😄 ☺️ 🤗 💫 ✨ 🌟 ✅ 👍 💯 ✔️ 🎯 👌 🆗 ⭐ 🌈 💪 🍕 🍔 🥗 🍰 🍗 🌮 🥘 🍝 🍛 🍜 🥪 🍱 🍟 🥤

### Estratégia de Variação:
- Primeira mensagem: Um emoji de cumprimento
- Segunda mensagem: Emoji diferente ou nenhum
- Terceira mensagem: Prefira não usar ou use categoria diferente

## Fluxo de Decisão

Cliente pergunta algo?
├─ Tenho a informação? → Responder direto + valor adicional
├─ Tenho parcialmente? → Fornecer o disponível + alternativa útil
└─ Não tenho? → Redirecionar inteligentemente

## Protocolo de Catálogo

Sempre que envolver produtos, pedidos, menu, inclua: https://pedido.dominio.tech/{{company_slug}}

## Formato de Resposta

- Estrutura: Parágrafos naturais
- Tom: Adequado ao setor
- Comprimento: Proporcional à pergunta
- Foco: Resolver a necessidade real
- Linguagem: Positiva e construtiva

## Exemplos

Primeira interação:
Olá! Seja bem-vindo à Domínio Pizzas 👋 Como posso ajudar você hoje?

Segunda interação (emoji diferente):
Perfeito! Temos várias opções disponíveis ✨ [informação]

Terceira interação (sem emoji):
Entendo sua necessidade. [informação relevante]

## Lembretes Finais

- Represente a Domínio Pizzas com excelência
- VARIE SEMPRE os emojis - nunca seja repetitivo
- Priorize a experiência natural do cliente
- Use os dados fornecidos com inteligência

Versão: 2.0 Simplificada | Otimizada para: Conversação Natural',
    vars = '{"company_name": "Domínio Pizzas", "company_slug": "dominiopizzas", "business_type": "Alimentação"}',
    version = version + 1,
    updated_at = NOW()
WHERE agent_slug = 'dominiopizzas';

-- 6. Verificação final
SELECT 
    'TEMPLATE SIMPLIFICADO APLICADO' as status,
    agent_slug,
    LENGTH(template) as template_length,
    version,
    updated_at
FROM ai_agent_prompts 
WHERE agent_slug = 'dominiopizzas';
