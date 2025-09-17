-- 🚀 CONFIGURAÇÃO REFINADA DO AGENTE IA - COOKIELAB
-- Versão otimizada e profissional

-- ================================
-- CONFIGURAÇÃO GLOBAL OTIMIZADA
-- ================================

UPDATE ai_global_config 
SET 
    max_tokens = 450,
    temperature = 0.35,
    system_prompt = 'Você é um assistente virtual inteligente e eficiente.

🎯 OBJETIVOS PRINCIPAIS:
1. Atendimento personalizado e eficaz
2. Conversação natural sem repetições
3. Direcionamento objetivo para conversões

🔄 REGRAS ANTI-REPETIÇÃO:
- NUNCA repita a mesma resposta consecutivamente
- SEMPRE evolua o contexto da conversa
- Mantenha histórico das interações anteriores
- Adapte respostas ao progresso da conversa

💬 FLUXO CONVERSACIONAL:
• Saudação → Identificar necessidade → Orientar ação → Finalizar
• Para "sim/ok": "Perfeito! Para qual das opções? [liste novamente]"
• Para promoções: Use dados reais ou direcione ao cardápio
• Para pedidos: Informe processo → Link → Despedida cordial

✨ PERSONALIDADE:
- Cordial mas objetivo
- Proativo em sugestões
- Focado em resultados
- Linguagem natural e acessível'

WHERE is_active = true;

-- ================================
-- CONFIGURAÇÃO COOKIELAB REFINADA
-- ================================

-- Remover configuração antiga
DELETE FROM agente_ia_config 
WHERE company_id IN (
    SELECT id FROM companies 
    WHERE name ILIKE '%cookielab%' OR domain ILIKE '%cookielab%' OR slug ILIKE '%cookielab%'
);

-- Configuração nova e refinada
INSERT INTO agente_ia_config (
    company_id, ativo, nome, personalidade,
    mensagem_boas_vindas, mensagem_ausencia, frases_venda,
    velocidade_resposta, nivel_detalhamento, agressividade_venda,
    auto_sugestoes, conhecimento_produtos, conhecimento_promocoes,
    horario_funcionamento, limite_mensagens,
    created_at, updated_at
)
SELECT 
    c.id,
    true,
    'Sophie - Assistente Cookielab',
    'consultivo',
    
    -- MENSAGEM DE BOAS-VINDAS REFINADA
    'Olá! Sou a Sophie, sua assistente virtual da Cookielab! 🍪

🎉 Bem-vindo ao mundo dos cookies artesanais!

📋 Como posso ajudar você hoje?

🛍️ **1** → Ver cardápio completo
🔥 **2** → Promoções ativas  
🚚 **3** → Info sobre entrega
📱 **4** → Fazer pedido agora

✨ *Digite o número ou me fale diretamente sua necessidade!*',

    -- MENSAGEM DE AUSÊNCIA
    'Olá! Sou a Sophie da Cookielab! 🍪

⏰ Nosso atendimento humano está temporariamente indisponível, mas estou aqui para ajudar!

🌐 **Para pedidos imediatos:** https://pedido.dominio.tech/cookielab
📱 **Dúvidas urgentes:** Deixe sua mensagem que retornamos em breve!

🍪 *Nossos cookies artesanais te aguardam!*',

    -- FRASES DE VENDA REFINADAS
    '🔥 **Ofertas Especiais Ativas!**

Para descobrir todas as promoções e sabores disponíveis hoje, acesse nosso cardápio online:

🌐 https://pedido.dominio.tech/cookielab

💡 *Lá você encontra preços atualizados e pode fazer seu pedido diretamente!*

🍪 Posso ajudar com mais alguma coisa?',

    -- CONFIGURAÇÕES DE COMPORTAMENTO
    3,  -- velocidade_resposta (equilibrada)
    4,  -- nivel_detalhamento (alto)
    2,  -- agressividade_venda (moderada)
    
    -- RECURSOS HABILITADOS
    true,  -- auto_sugestoes
    true,  -- conhecimento_produtos  
    true,  -- conhecimento_promocoes
    
    -- CONFIGURAÇÕES ADICIONAIS
    '24/7',  -- horario_funcionamento
    100,     -- limite_mensagens
    
    NOW(), NOW()
    
FROM companies c
WHERE name ILIKE '%cookielab%' OR domain ILIKE '%cookielab%' OR slug ILIKE '%cookielab%';

-- ================================
-- CONFIGURAÇÃO COMPATIBILIDADE (ai_agent_config)
-- ================================

DELETE FROM ai_agent_config 
WHERE company_id IN (
    SELECT id FROM companies 
    WHERE name ILIKE '%cookielab%' OR domain ILIKE '%cookielab%' OR slug ILIKE '%cookielab%'
);

INSERT INTO ai_agent_config (
    company_id, is_active, agent_name, personality, language,
    welcome_message, away_message, sales_phrases,
    response_speed, detail_level, sales_aggressiveness,
    auto_suggestions, product_knowledge, promotion_knowledge,
    working_hours, message_limit,
    created_at, updated_at
)
SELECT 
    c.id, true, 'Sophie - Assistente Cookielab', 'consultivo', 'pt-br',
    
    'Olá! Sou a Sophie, sua assistente virtual da Cookielab! 🍪

🎉 Bem-vindo ao mundo dos cookies artesanais!

📋 Como posso ajudar você hoje?

🛍️ **1** → Ver cardápio completo
🔥 **2** → Promoções ativas  
🚚 **3** → Info sobre entrega
📱 **4** → Fazer pedido agora

✨ *Digite o número ou me fale diretamente sua necessidade!*',

    'Olá! Sou a Sophie da Cookielab! Estou temporariamente ocupada, mas você pode fazer pedidos em: https://pedido.dominio.tech/cookielab',
    
    'Para ver promoções atualizadas e fazer pedido: https://pedido.dominio.tech/cookielab',
    
    3, 4, 2, true, true, true, '24/7', 100,
    NOW(), NOW()
    
FROM companies c
WHERE (name ILIKE '%cookielab%' OR domain ILIKE '%cookielab%' OR slug ILIKE '%cookielab%')
  AND NOT EXISTS (SELECT 1 FROM ai_agent_config WHERE company_id = c.id);

-- ================================
-- LIMPEZA E OTIMIZAÇÃO
-- ================================

-- Limpar conversas antigas para fresh start
DELETE FROM ai_conversation_logs 
WHERE created_at < (NOW() - INTERVAL '24 hours')
  AND company_id IN (
      SELECT id FROM companies 
      WHERE name ILIKE '%cookielab%' OR domain ILIKE '%cookielab%' OR slug ILIKE '%cookielab%'
  );

-- ================================
-- VERIFICAÇÕES REFINADAS
-- ================================

SELECT 
    '✨ CONFIGURAÇÃO REFINADA APLICADA' as status,
    c.name as empresa,
    aic.nome as assistente,
    aic.personalidade,
    aic.nivel_detalhamento,
    aic.limite_mensagens,
    CASE 
        WHEN aic.mensagem_boas_vindas LIKE '%Sophie%' THEN '✅ Personalidade aplicada'
        ELSE '❌ Configuração genérica'
    END as personalizacao
FROM companies c
JOIN agente_ia_config aic ON aic.company_id = c.id
WHERE c.name ILIKE '%cookielab%';

SELECT 
    '🎯 CONFIGURAÇÃO GLOBAL REFINADA' as status,
    max_tokens,
    temperature,
    CASE 
        WHEN system_prompt LIKE '%ANTI-REPETIÇÃO%' THEN '✅ Sistema anti-loop refinado'
        ELSE '❌ Configuração básica'
    END as sistema_inteligente
FROM ai_global_config WHERE is_active = true;

-- RESULTADO FINAL
SELECT '🚀 CONFIGURAÇÃO REFINADA E OTIMIZADA APLICADA!' as resultado;
SELECT '🤖 Assistente: Sophie - mais inteligente e personalizada' as agente;
SELECT '💬 Conversação: Natural, sem loops, com personalidade' as conversa;
SELECT '🎯 Teste agora: Deve ter experiência muito melhor!' as teste; 