-- 🔍 DIAGNÓSTICO COMPLETO + CORREÇÃO FORÇADA
-- Execute este script para identificar e corrigir o problema de loop

-- ================================
-- PASSO 1: DIAGNÓSTICO COMPLETO
-- ================================

-- Verificar todas as empresas com "cookielab" no nome
SELECT '🏢 EMPRESAS COOKIELAB' as info, id, name, domain, slug, status
FROM companies 
WHERE name ILIKE '%cookielab%' OR domain ILIKE '%cookielab%' OR slug ILIKE '%cookielab%';

-- Verificar configuração global de IA
SELECT '⚙️ CONFIG GLOBAL IA' as info, id, max_tokens, temperature, is_active, 
       LEFT(system_prompt, 100) || '...' as system_prompt_preview
FROM ai_global_config 
WHERE is_active = true;

-- Verificar TODAS as configurações de agente (todas as tabelas)
SELECT '🤖 CONFIG AGENTE (agente_ia_config)' as tabela, 
       c.name as empresa, 
       aic.nome as agente_nome, 
       aic.ativo,
       LEFT(aic.mensagem_boas_vindas, 100) || '...' as boas_vindas_preview
FROM agente_ia_config aic
JOIN companies c ON c.id = aic.company_id
WHERE c.name ILIKE '%cookielab%';

-- Verificar se existe na tabela ai_agent_config também
SELECT '🤖 CONFIG AGENTE (ai_agent_config)' as tabela,
       c.name as empresa,
       aac.agent_name as agente_nome,
       aac.is_active,
       LEFT(aac.welcome_message, 100) || '...' as boas_vindas_preview
FROM ai_agent_config aac
JOIN companies c ON c.id = aac.company_id
WHERE c.name ILIKE '%cookielab%';

-- ================================
-- PASSO 2: LIMPEZA TOTAL
-- ================================

-- Remover TODAS as conversas da Cookielab
DELETE FROM ai_conversation_logs 
WHERE company_id IN (
    SELECT id FROM companies 
    WHERE name ILIKE '%cookielab%' OR domain ILIKE '%cookielab%' OR slug ILIKE '%cookielab%'
);

-- ================================
-- PASSO 3: CORREÇÃO FORÇADA - CONFIGURAÇÃO GLOBAL
-- ================================

-- Forçar configuração global anti-loop
UPDATE ai_global_config 
SET 
    max_tokens = 400,
    temperature = 0.3,
    system_prompt = 'Você é um atendente virtual especializado. 

REGRAS ANTI-LOOP OBRIGATÓRIAS:
1. NUNCA repita exatamente a mesma resposta anterior
2. SEMPRE forneça informações específicas, nunca genéricas
3. SEMPRE avance na conversa oferecendo opções claras e numeradas
4. Se cliente diz "sim" ou "ok", pergunte ESPECIFICAMENTE sobre o que
5. FLUXO: Informar → Direcionar para pedido → ENCERRAR sem mais perguntas

QUANDO CLIENTE DIZ "SIM":
- NÃO repita ofertas genéricas
- PERGUNTE: "Para qual opção você está dizendo sim? 1) Ver cardápio, 2) Fazer pedido, 3) Saber mais sobre algo específico?"

PARA PROMOÇÕES:
- Use APENAS dados reais da empresa
- Se não tem dados específicos: "Para ver todas as promoções atualizadas, acesse nosso cardápio"

APÓS ENVIAR LINK:
- Diga: "Fico no aguardo do seu pedido! Qualquer dúvida estarei aqui."
- NÃO faça mais perguntas sobre promoções

Seja direto, específico e progrida sempre na conversa.'

WHERE is_active = true;

-- ================================  
-- PASSO 4: CORREÇÃO FORÇADA - TABELA agente_ia_config
-- ================================

-- Deletar configuração antiga da Cookielab
DELETE FROM agente_ia_config 
WHERE company_id IN (
    SELECT id FROM companies 
    WHERE name ILIKE '%cookielab%' OR domain ILIKE '%cookielab%' OR slug ILIKE '%cookielab%'
);

-- Inserir configuração nova e correta
INSERT INTO agente_ia_config (
    company_id, ativo, nome, personalidade,
    mensagem_boas_vindas, mensagem_ausencia, frases_venda,
    velocidade_resposta, nivel_detalhamento, agressividade_venda,
    auto_sugestoes, conhecimento_produtos, conhecimento_promocoes,
    created_at, updated_at
)
SELECT 
    c.id,
    true,
    'Atendente Cookielab',
    'profissional',
    'Olá! Bem-vindo à Cookielab! 🍪

Como posso ajudar você hoje?

1️⃣ Ver nosso cardápio completo
2️⃣ Conhecer promoções atuais  
3️⃣ Informações sobre entrega
4️⃣ Fazer um pedido

Digite o número da opção ou me diga o que precisa!',
    'No momento nosso atendimento está ocupado. Para ver nosso cardápio e fazer pedidos, acesse: https://pedido.dominio.tech/cookielab',
    'Temos promoções especiais! Para ver todas as ofertas atualizadas e fazer seu pedido, acesse nosso cardápio online: https://pedido.dominio.tech/cookielab',
    3, 4, 1,
    true, true, true,
    NOW(), NOW()
FROM companies c
WHERE name ILIKE '%cookielab%' OR domain ILIKE '%cookielab%' OR slug ILIKE '%cookielab%';

-- ================================
-- PASSO 5: CORREÇÃO FORÇADA - TABELA ai_agent_config  
-- ================================

-- Deletar configuração antiga da Cookielab (se existir)
DELETE FROM ai_agent_config 
WHERE company_id IN (
    SELECT id FROM companies 
    WHERE name ILIKE '%cookielab%' OR domain ILIKE '%cookielab%' OR slug ILIKE '%cookielab%'
);

-- Inserir configuração nova (compatibilidade)
INSERT INTO ai_agent_config (
    company_id, is_active, agent_name, personality, language,
    welcome_message, away_message, sales_phrases,
    response_speed, detail_level, sales_aggressiveness,
    auto_suggestions, product_knowledge, promotion_knowledge,
    created_at, updated_at
)
SELECT 
    c.id,
    true,
    'Atendente Cookielab',
    'profissional',
    'pt-br',
    'Olá! Bem-vindo à Cookielab! 🍪

Como posso ajudar você hoje?

1️⃣ Ver nosso cardápio completo
2️⃣ Conhecer promoções atuais  
3️⃣ Informações sobre entrega
4️⃣ Fazer um pedido

Digite o número da opção ou me diga o que precisa!',
    'No momento nosso atendimento está ocupado. Acesse: https://pedido.dominio.tech/cookielab',
    'Para ver promoções e fazer pedido: https://pedido.dominio.tech/cookielab',
    3, 4, 1,
    true, true, true,
    NOW(), NOW()
FROM companies c
WHERE (name ILIKE '%cookielab%' OR domain ILIKE '%cookielab%' OR slug ILIKE '%cookielab%')
  AND NOT EXISTS (SELECT 1 FROM ai_agent_config WHERE company_id = c.id);

-- ================================
-- VERIFICAÇÕES FINAIS
-- ================================

-- Mostrar configuração global aplicada
SELECT '✅ CONFIG GLOBAL FINAL' as status,
       max_tokens, temperature, is_active,
       CASE WHEN system_prompt LIKE '%ANTI-LOOP%' THEN '✅ Anti-loop aplicado' ELSE '❌ Ainda sem anti-loop' END
FROM ai_global_config WHERE is_active = true;

-- Mostrar configuração da Cookielab final
SELECT '✅ CONFIG COOKIELAB FINAL' as status,
       c.name as empresa,
       aic.nome as agente_nome,
       aic.ativo,
       CASE WHEN aic.mensagem_boas_vindas LIKE '%1️⃣%' THEN '✅ Opções numeradas' ELSE '❌ Sem opções' END as tem_opcoes
FROM companies c
JOIN agente_ia_config aic ON aic.company_id = c.id
WHERE c.name ILIKE '%cookielab%';

-- Resultado
SELECT '🎯 DIAGNÓSTICO E CORREÇÃO FORÇADA CONCLUÍDA!' as resultado;
SELECT 'Agora teste uma NOVA conversa no WhatsApp' as proxima_acao; 