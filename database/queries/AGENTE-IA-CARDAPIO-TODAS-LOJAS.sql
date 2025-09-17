-- 🔗 AGENTE IA: CARDÁPIO NA SAUDAÇÃO PARA TODAS AS LOJAS
-- Script para incluir link do cardápio automaticamente na mensagem inicial

-- ================================
-- PASSO 1: CONFIGURAÇÃO GLOBAL OTIMIZADA
-- ================================

UPDATE ai_global_config 
SET system_prompt = 'Você é um assistente virtual inteligente e especializado.

🎯 COMPORTAMENTO OBRIGATÓRIO:
1. SEMPRE inclua o link do cardápio na primeira interação
2. Use o formato: https://pedido.dominio.tech/[slug-da-empresa]
3. Seja acolhedor e ofereça o cardápio como primeira opção
4. NUNCA repita mensagens - evolua sempre a conversa
5. Após enviar cardápio, aguarde ação do cliente

📋 FLUXO PADRÃO:
• Saudação + Nome do assistente + Cardápio + Opções
• Para dúvidas: responda e direcione ao cardápio
• Para pedidos: reforce o cardápio e encerre
• SEMPRE finalize com o link do cardápio

✨ PERSONALIDADE:
- Caloroso e acolhedor
- Direto ao ponto
- Focado em conversão
- Linguagem natural do Brasil'
WHERE is_active = true;

-- ================================
-- PASSO 2: ATUALIZAR TODAS AS EMPRESAS ATIVAS
-- ================================

-- Atualizar mensagens de boas-vindas para incluir cardápio
UPDATE agente_ia_config 
SET mensagem_boas_vindas = CONCAT(
    'Olá! Sou ', 
    COALESCE(nome, 'sua assistente virtual'),
    ' da ', 
    COALESCE(
        (SELECT name FROM companies WHERE id = agente_ia_config.company_id), 
        'nossa empresa'
    ), 
    '! 😊

🍽️ **Veja nosso cardápio completo:**
🌐 https://pedido.dominio.tech/', 
    COALESCE(
        (SELECT slug FROM companies WHERE id = agente_ia_config.company_id AND slug IS NOT NULL), 
        (SELECT LOWER(REPLACE(REPLACE(name, ' ', '-'), '.', '')) FROM companies WHERE id = agente_ia_config.company_id)
    ),

'

📋 **Como posso ajudar você hoje?**

🛍️ **1** → Fazer pedido agora
🔥 **2** → Ver promoções ativas  
🚚 **3** → Informações de entrega
💬 **4** → Falar com atendente

✨ *Digite o número ou me fale sua necessidade!*'
),
frases_venda = CONCAT(
    '🔥 **Confira nossas ofertas especiais!**

🌐 **Cardápio completo:** https://pedido.dominio.tech/', 
    COALESCE(
        (SELECT slug FROM companies WHERE id = agente_ia_config.company_id AND slug IS NOT NULL), 
        (SELECT LOWER(REPLACE(REPLACE(name, ' ', '-'), '.', '')) FROM companies WHERE id = agente_ia_config.company_id)
    ),

'

💡 *Lá você encontra todos os produtos, preços atualizados e pode fazer seu pedido diretamente!*

🍽️ Posso ajudar com mais alguma coisa?'
),
nivel_detalhamento = 3,
velocidade_resposta = 3,
agressividade_venda = 2
WHERE ativo = true;

-- ================================
-- PASSO 3: CRIAR CONFIGURAÇÕES PARA EMPRESAS SEM AGENTE
-- ================================

INSERT INTO agente_ia_config (
    company_id, ativo, nome, personalidade,
    mensagem_boas_vindas, frases_venda, mensagem_ausencia,
    velocidade_resposta, nivel_detalhamento, agressividade_venda,
    auto_sugestoes, conhecimento_produtos, conhecimento_promocoes,
    created_at, updated_at
)
SELECT 
    c.id,
    true,
    CONCAT('Assistente ', c.name),
    'simpatico',
    
    -- MENSAGEM DE BOAS-VINDAS COM CARDÁPIO
    CONCAT(
        'Olá! Sou a assistente virtual da ', c.name, '! 😊

🍽️ **Veja nosso cardápio completo:**
🌐 https://pedido.dominio.tech/', 
        COALESCE(c.slug, LOWER(REPLACE(REPLACE(c.name, ' ', '-'), '.', ''))),
        '

📋 **Como posso ajudar você hoje?**

🛍️ **1** → Fazer pedido agora
🔥 **2** → Ver promoções ativas  
🚚 **3** → Informações de entrega
💬 **4** → Falar com atendente

✨ *Digite o número ou me fale sua necessidade!*'
    ),
    
    -- FRASES DE VENDA COM CARDÁPIO
    CONCAT(
        '🔥 **Confira nossas ofertas especiais!**

🌐 **Cardápio completo:** https://pedido.dominio.tech/', 
        COALESCE(c.slug, LOWER(REPLACE(REPLACE(c.name, ' ', '-'), '.', ''))),
        '

💡 *Lá você encontra todos os produtos, preços atualizados e pode fazer seu pedido diretamente!*

🍽️ Posso ajudar com mais alguma coisa?'
    ),
    
    -- MENSAGEM DE AUSÊNCIA
    CONCAT(
        'Olá! Sou a assistente da ', c.name, '! 

⏰ Nosso atendimento está temporariamente indisponível, mas você pode fazer pedidos:

🌐 https://pedido.dominio.tech/', 
        COALESCE(c.slug, LOWER(REPLACE(REPLACE(c.name, ' ', '-'), '.', ''))),
        '

📱 Deixe sua mensagem que retornamos em breve!'
    ),
    
    3, 3, 2, -- configurações
    true, true, true, -- recursos
    NOW(), NOW()
FROM companies c
WHERE c.status = 'active'
  AND c.id NOT IN (SELECT company_id FROM agente_ia_config WHERE ativo = true);

-- ================================
-- PASSO 4: ATUALIZAR TABELA DE COMPATIBILIDADE
-- ================================

-- Limpar configurações antigas
DELETE FROM ai_agent_config;

-- Recriar para todas as empresas ativas
INSERT INTO ai_agent_config (
    company_id, is_active, agent_name, personality, language,
    welcome_message, sales_phrases, away_message,
    response_speed, detail_level, sales_aggressiveness,
    auto_suggestions, product_knowledge, promotion_knowledge,
    created_at, updated_at
)
SELECT 
    c.id, true, 
    CONCAT('Assistente ', c.name), 
    'simpatico', 'pt-br',
    
    -- MENSAGEM DE BOAS-VINDAS
    CONCAT(
        'Olá! Sou a assistente virtual da ', c.name, '! 😊

🍽️ **Veja nosso cardápio completo:**
🌐 https://pedido.dominio.tech/', 
        COALESCE(c.slug, LOWER(REPLACE(REPLACE(c.name, ' ', '-'), '.', ''))),
        '

📋 **Como posso ajudar você hoje?**

🛍️ **1** → Fazer pedido agora
🔥 **2** → Ver promoções ativas  
🚚 **3** → Informações de entrega
💬 **4** → Falar com atendente

✨ *Digite o número ou me fale sua necessidade!*'
    ),
    
    -- FRASES DE VENDA
    CONCAT(
        'Para ver produtos e fazer pedido: https://pedido.dominio.tech/', 
        COALESCE(c.slug, LOWER(REPLACE(REPLACE(c.name, ' ', '-'), '.', '')))
    ),
    
    -- MENSAGEM DE AUSÊNCIA
    CONCAT(
        'Olá! Para pedidos: https://pedido.dominio.tech/', 
        COALESCE(c.slug, LOWER(REPLACE(REPLACE(c.name, ' ', '-'), '.', '')))
    ),
    
    3, 3, 2, true, true, true,
    NOW(), NOW()
FROM companies c
WHERE c.status = 'active';

-- ================================
-- PASSO 5: LIMPAR CONVERSAS ANTIGAS
-- ================================

-- Remover conversas antigas para aplicar nova configuração
DELETE FROM ai_conversation_logs 
WHERE created_at < (NOW() - INTERVAL '2 hours');

-- ================================
-- VERIFICAÇÕES FINAIS
-- ================================

-- Ver configurações aplicadas
SELECT 
    '🎯 EMPRESAS COM CARDÁPIO CONFIGURADO' as status,
    c.name as empresa,
    c.slug,
    aic.nome as assistente,
    CASE 
        WHEN aic.mensagem_boas_vindas LIKE '%pedido.dominio.tech%' THEN '✅ Cardápio incluído'
        ELSE '❌ Sem cardápio'
    END as tem_cardapio,
    CASE 
        WHEN aic.ativo THEN '✅ Ativo'
        ELSE '❌ Inativo'
    END as status_agente
FROM companies c
LEFT JOIN agente_ia_config aic ON aic.company_id = c.id
WHERE c.status = 'active'
ORDER BY c.name;

-- Estatísticas finais
SELECT 
    '📊 ESTATÍSTICAS FINAIS' as info,
    COUNT(*) as total_empresas,
    COUNT(CASE WHEN aic.id IS NOT NULL THEN 1 END) as com_agente_configurado,
    COUNT(CASE WHEN aic.mensagem_boas_vindas LIKE '%pedido.dominio.tech%' THEN 1 END) as com_cardapio
FROM companies c
LEFT JOIN agente_ia_config aic ON aic.company_id = c.id
WHERE c.status = 'active';

-- Resultado
SELECT '🚀 CARDÁPIO CONFIGURADO PARA TODAS AS LOJAS!' as resultado;
SELECT 'Agora todas as empresas incluem o cardápio na saudação' as info;
SELECT 'Teste em qualquer loja: deve mostrar o link automaticamente' as teste; 