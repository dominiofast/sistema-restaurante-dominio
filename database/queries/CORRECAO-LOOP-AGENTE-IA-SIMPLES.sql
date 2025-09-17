-- 🔧 CORREÇÃO LOOP AGENTE IA - VERSÃO ULTRA SIMPLES
-- Execute este script no SQL Editor do Supabase

-- ================================
-- CORREÇÃO PRINCIPAL: CONFIGURAÇÃO GLOBAL
-- ================================

UPDATE ai_global_config 
SET 
    max_tokens = 500,
    temperature = 0.4,
    system_prompt = 'Você é um atendente virtual especializado. REGRAS ANTI-LOOP: 1) NUNCA repita a mesma resposta 2) SEMPRE forneça informações específicas 3) SEMPRE avance na conversa oferecendo opções claras 4) Se cliente pergunta promoções, mencione produtos e preços 5) Se cliente diz "sim", pergunte especificamente o que ele quer. Seja específico, não genérico.'
WHERE is_active = true;

-- ================================
-- CONFIGURAÇÃO COOKIELAB 
-- ================================

-- Primeiro, vamos encontrar e configurar a Cookielab
UPDATE agente_ia_config 
SET 
    nome = 'Atendente Cookielab',
    mensagem_boas_vindas = 'Olá! Bem-vindo à Cookielab! 🍪

Como posso ajudar você hoje?

1️⃣ Ver nossos cookies disponíveis
2️⃣ Saber sobre promoções ativas  
3️⃣ Informações sobre entrega
4️⃣ Fazer um pedido

Digite o número ou me diga diretamente!',
    frases_venda = 'Experimente nossos cookies especiais! 

🔥 PROMOÇÕES HOJE:
• Cookie Chocolate Duplo - R$ 9,90 (era R$ 12,90)
• Cookie Red Velvet - R$ 8,90  
• Combo Cookie + Café - R$ 14,90

Qual te interessa mais?',
    nivel_detalhamento = 4,
    conhecimento_produtos = true,
    conhecimento_promocoes = true,
    ativo = true
WHERE company_id IN (
    SELECT id FROM companies 
    WHERE name ILIKE '%cookielab%' OR domain ILIKE '%cookielab%' OR slug ILIKE '%cookielab%'
);

-- Se não existe configuração para Cookielab, criar uma
INSERT INTO agente_ia_config (
    company_id,
    ativo,
    nome,
    personalidade,
    mensagem_boas_vindas,
    frases_venda,
    velocidade_resposta,
    nivel_detalhamento,
    agressividade_venda,
    auto_sugestoes,
    conhecimento_produtos,
    conhecimento_promocoes
)
SELECT 
    id,
    true,
    'Atendente Cookielab',
    'simpatico',
    'Olá! Bem-vindo à Cookielab! 🍪

Como posso ajudar você hoje?

1️⃣ Ver nossos cookies disponíveis
2️⃣ Saber sobre promoções ativas  
3️⃣ Informações sobre entrega
4️⃣ Fazer um pedido

Digite o número ou me diga diretamente!',
    'Experimente nossos cookies especiais! 

🔥 PROMOÇÕES HOJE:
• Cookie Chocolate Duplo - R$ 9,90 (era R$ 12,90)
• Cookie Red Velvet - R$ 8,90  
• Combo Cookie + Café - R$ 14,90

Qual te interessa mais?',
    3,
    4,
    2,
    true,
    true,
    true
FROM companies 
WHERE (name ILIKE '%cookielab%' OR domain ILIKE '%cookielab%' OR slug ILIKE '%cookielab%')
  AND id NOT IN (SELECT company_id FROM agente_ia_config);

-- ================================
-- LIMPEZA DE CONVERSAS ANTIGAS
-- ================================

DELETE FROM ai_conversation_logs 
WHERE created_at < (NOW() - INTERVAL '1 hour')
  AND company_id IN (
      SELECT id FROM companies 
      WHERE name ILIKE '%cookielab%' OR domain ILIKE '%cookielab%' OR slug ILIKE '%cookielab%'
  );

-- ================================
-- VERIFICAÇÕES
-- ================================

-- Verificar configuração global
SELECT 
    '🎯 CONFIG GLOBAL' as check_type,
    max_tokens,
    temperature,
    CASE WHEN LENGTH(system_prompt) > 100 THEN 'Prompt atualizado ✅' ELSE 'Prompt muito curto ❌' END as prompt_status
FROM ai_global_config 
WHERE is_active = true;

-- Verificar configuração da Cookielab
SELECT 
    '🍪 CONFIG COOKIELAB' as check_type,
    c.name as empresa,
    aic.nome as agente_nome,
    aic.nivel_detalhamento,
    aic.conhecimento_produtos,
    CASE WHEN LENGTH(aic.mensagem_boas_vindas) > 50 THEN 'Boas-vindas configuradas ✅' ELSE 'Boas-vindas muito curtas ❌' END as boas_vindas_status
FROM companies c
JOIN agente_ia_config aic ON aic.company_id = c.id
WHERE c.name ILIKE '%cookielab%' OR c.domain ILIKE '%cookielab%' OR c.slug ILIKE '%cookielab%';

-- Resultado final
SELECT '🎉 CORREÇÃO APLICADA!' as resultado;
SELECT 'Teste agora uma nova conversa no WhatsApp' as acao; 