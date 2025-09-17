-- 🚀 APLICAR TEMPLATE CONVERSACIONAL - TODAS AS EMPRESAS
-- Aplicar o template que está funcionando na Domínio Pizzas para todas as empresas

-- ================================
-- APLICAR TEMPLATE EM TODAS AS EMPRESAS
-- ================================

-- 1. Primeiro, listar todas as empresas
SELECT 
    'LISTANDO EMPRESAS' as status,
    c.id as company_id,
    c.name as company_name,
    c.slug as company_slug,
    COUNT(p.agent_slug) as prompts_existentes
FROM companies c
LEFT JOIN ai_agent_prompts p ON p.agent_slug = c.slug
GROUP BY c.id, c.name, c.slug
ORDER BY c.name;

-- 2. Aplicar template conversacional em todas as empresas
INSERT INTO ai_agent_prompts (
    agent_slug,
    template,
    vars,
    version,
    updated_at
) 
SELECT 
    c.slug as agent_slug,
    'Você é o assistente virtual especializado da ' || c.name || '. Sua missão é fornecer uma experiência excepcional através de respostas inteligentes, acolhedoras e precisas.

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
Olá! Seja bem-vindo à ' || c.name || ' 👋 Como posso ajudar você hoje?

Segunda interação (emoji diferente):
Perfeito! Temos várias opções disponíveis ✨ [informação]

Terceira interação (sem emoji):
Entendo sua necessidade. [informação relevante]

## Lembretes Finais

- Represente a ' || c.name || ' com excelência
- VARIE SEMPRE os emojis - nunca seja repetitivo
- Priorize a experiência natural do cliente
- Use os dados fornecidos com inteligência

Versão: 2.0 Conversacional | Otimizada para: ' || c.name as template,
    '{"company_name": "' || c.name || '", "company_slug": "' || c.slug || '", "business_type": "Negócio"}' as vars,
    1 as version,
    NOW() as updated_at
FROM companies c
WHERE c.slug IS NOT NULL
ON CONFLICT (agent_slug) DO UPDATE SET
    template = EXCLUDED.template,
    vars = EXCLUDED.vars,
    version = ai_agent_prompts.version + 1,
    updated_at = NOW();

-- 3. Ativar modo direto para todas as empresas
UPDATE ai_agent_assistants 
SET 
    use_direct_mode = true,
    is_active = true,
    updated_at = NOW()
WHERE company_id IN (SELECT id FROM companies WHERE slug IS NOT NULL);

-- 4. Verificação final
SELECT 
    'TEMPLATE APLICADO' as status,
    c.name as empresa,
    c.slug as agent_slug,
    p.template_length,
    p.version,
    a.use_direct_mode,
    a.is_active
FROM companies c
LEFT JOIN ai_agent_prompts p ON p.agent_slug = c.slug
LEFT JOIN ai_agent_assistants a ON a.company_id = c.id
WHERE c.slug IS NOT NULL
ORDER BY c.name;

-- 5. Log da aplicação
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
    'APLICAÇÃO EM MASSA: Template conversacional aplicado em todas as empresas - modo direto ativo',
    'mass_template_application',
    NOW()
);
