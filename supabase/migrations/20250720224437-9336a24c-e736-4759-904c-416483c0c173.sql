-- Corrigir problema crítico da IA - temperature muito alta e múltiplas configurações ativas

-- Primeiro, desativar todas as configurações antigas
UPDATE ai_global_config SET is_active = false;

-- Criar uma configuração única e correta
UPDATE ai_global_config 
SET is_active = true,
    temperature = 0.7,
    max_tokens = 200,
    openai_model = 'gpt-4.1-2025-04-14'
WHERE id = '59bc28e0-37a6-4a5f-bdd3-9fcb35dbfb34';

-- Se não encontrar, inserir uma nova configuração correta
INSERT INTO ai_global_config (
    openai_api_key,
    openai_model,
    temperature,
    max_tokens,
    system_prompt,
    is_active
) 
SELECT 
    'YOUR_OPENAI_API_KEY_HERE',
    'gpt-4.1-2025-04-14',
    0.7,
    200,
    'Você é um assistente virtual especializado em atendimento ao cliente para restaurantes e estabelecimentos comerciais.',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM ai_global_config WHERE is_active = true AND temperature = 0.7
);

-- Remover todas as configurações inativas
DELETE FROM ai_global_config WHERE is_active = false;