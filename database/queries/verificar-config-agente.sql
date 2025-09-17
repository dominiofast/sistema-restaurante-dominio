-- Verificar configuração atual do agente IA
SELECT 
    '🏢 EMPRESAS E CONFIGURAÇÕES' as info;

-- Verificar empresas e suas configurações
SELECT 
    c.name as empresa,
    c.slug,
    aic.agent_name,
    aic.welcome_message,
    aic.personality,
    aic.is_active,
    CASE WHEN aic.id IS NOT NULL THEN '✅ Configurado' ELSE '❌ Não configurado' END as status
FROM companies c 
LEFT JOIN ai_agent_config aic ON aic.company_id = c.id 
ORDER BY c.created_at DESC;

-- Verificar configuração global
SELECT 
    '🌐 CONFIGURAÇÃO GLOBAL' as info;

SELECT 
    openai_model,
    max_tokens,
    temperature,
    is_active,
    CASE WHEN LENGTH(system_prompt) > 100 THEN 'Prompt configurado ✅' ELSE 'Prompt muito curto ❌' END as prompt_status
FROM ai_global_config 
WHERE is_active = true;

-- Verificar se existe configuração da Quadrata Pizzas
SELECT 
    '🍕 VERIFICAÇÃO QUADRATA PIZZAS' as info;

SELECT 
    c.name,
    c.slug,
    aic.agent_name,
    aic.welcome_message
FROM companies c 
LEFT JOIN ai_agent_config aic ON aic.company_id = c.id 
WHERE c.name ILIKE '%quadrata%' OR c.slug ILIKE '%quadrata%';

-- Verificar tabela antiga agente_ia_config
SELECT 
    '📋 TABELA ANTIGA (agente_ia_config)' as info;

SELECT 
    c.name as empresa,
    aic.nome as agente_nome,
    aic.mensagem_boas_vindas,
    aic.ativo
FROM companies c 
JOIN agente_ia_config aic ON aic.company_id = c.id 
ORDER BY c.name;