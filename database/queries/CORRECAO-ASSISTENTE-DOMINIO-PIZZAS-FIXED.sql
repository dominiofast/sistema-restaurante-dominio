-- 🔧 CORREÇÃO URGENTE: Domínio Pizzas usando Assistant ID excluído - VERSÃO CORRIGIDA
-- Execute este script no SQL Editor do Supabase para corrigir o problema

-- ================================
-- PASSO 1: REMOVER ASSISTANT ID DA INTEGRAÇÃO
-- ================================

-- Remover o ia_agent_preset (Assistant ID) da integração WhatsApp
UPDATE whatsapp_integrations 
SET 
    ia_agent_preset = NULL,
    ia_model = 'gpt-4o-mini',
    ia_temperature = 0.7
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- ================================
-- PASSO 2: CONFIGURAR AGENTE IA PERSONALIZADO (UPDATE)
-- ================================

-- Atualizar configuração existente para Domínio Pizzas
UPDATE ai_agent_config 
SET 
    is_active = true,
    agent_name = 'Assistente Domínio Pizzas',
    personality = 'simpatico',
    language = 'pt-br',
    
    -- MENSAGEM DE BOAS-VINDAS PERSONALIZADA
    welcome_message = 'Olá! Sou o Assistente Domínio Pizzas! 🍕

Bem-vindo à melhor pizzaria da região!

Como posso ajudar você hoje?

🍕 **1** → Ver nosso cardápio completo
🔥 **2** → Promoções ativas  
🚚 **3** → Informações sobre entrega
📱 **4** → Fazer pedido agora

✨ *Digite o número ou me fale diretamente sua necessidade!*',

    -- MENSAGEM DE AUSÊNCIA
    away_message = 'Olá! Sou o Assistente Domínio Pizzas! 🍕

⏰ Nosso atendimento humano está temporariamente indisponível, mas estou aqui para ajudar!

🌐 **Para pedidos imediatos:** https://pedido.dominio.tech/dominiopizzas
📱 **Dúvidas urgentes:** Deixe sua mensagem que retornamos em breve!

🍕 *Nossas pizzas artesanais te aguardam!*',

    -- MENSAGEM DE DESPEDIDA
    goodbye_message = 'Obrigado por escolher a Domínio Pizzas! 🍕

Esperamos que você tenha uma experiência incrível!

Até a próxima! 👋',

    -- FRASES DE VENDA
    sales_phrases = '🔥 **Ofertas Especiais da Domínio Pizzas!**

Para descobrir todas as promoções e sabores disponíveis hoje, acesse nosso cardápio online:

🌐 https://pedido.dominio.tech/dominiopizzas

💡 *Lá você encontra preços atualizados e pode fazer seu pedido diretamente!*

🍕 Posso ajudar com mais alguma coisa?',

    -- CONFIGURAÇÕES DE COMPORTAMENTO
    response_speed = 3,  -- velocidade_resposta (equilibrada)
    detail_level = 4,  -- nivel_detalhamento (alto)
    sales_aggressiveness = 2,  -- agressividade_venda (moderada)
    
    -- CONFIGURAÇÕES ADICIONAIS
    working_hours = '24/7',  -- horario_funcionamento
    message_limit = 100,     -- limite_mensagens
    
    -- RECURSOS HABILITADOS
    auto_suggestions = true,  -- auto_sugestoes
    order_reminders = true,  -- lembretes_pedidos
    data_collection = false, -- coleta_dados
    whatsapp_integration = true,  -- integracao_whatsapp
    manager_notifications = true,  -- notificacoes_gerente
    product_knowledge = true,  -- conhecimento_produtos
    promotion_knowledge = true,  -- conhecimento_promocoes
    stock_knowledge = false, -- conhecimento_estoque
    
    updated_at = NOW()
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Se não existir configuração, criar uma nova
INSERT INTO ai_agent_config (
    company_id,
    is_active,
    agent_name,
    personality,
    language,
    welcome_message,
    away_message,
    goodbye_message,
    sales_phrases,
    response_speed,
    detail_level,
    sales_aggressiveness,
    working_hours,
    message_limit,
    auto_suggestions,
    order_reminders,
    data_collection,
    whatsapp_integration,
    manager_notifications,
    product_knowledge,
    promotion_knowledge,
    stock_knowledge,
    created_at,
    updated_at
) 
SELECT 
    '550e8400-e29b-41d4-a716-446655440001',
    true,
    'Assistente Domínio Pizzas',
    'simpatico',
    'pt-br',
    
    -- MENSAGEM DE BOAS-VINDAS PERSONALIZADA
    'Olá! Sou o Assistente Domínio Pizzas! 🍕

Bem-vindo à melhor pizzaria da região!

Como posso ajudar você hoje?

🍕 **1** → Ver nosso cardápio completo
🔥 **2** → Promoções ativas  
🚚 **3** → Informações sobre entrega
📱 **4** → Fazer pedido agora

✨ *Digite o número ou me fale diretamente sua necessidade!*',

    -- MENSAGEM DE AUSÊNCIA
    'Olá! Sou o Assistente Domínio Pizzas! 🍕

⏰ Nosso atendimento humano está temporariamente indisponível, mas estou aqui para ajudar!

🌐 **Para pedidos imediatos:** https://pedido.dominio.tech/dominiopizzas
📱 **Dúvidas urgentes:** Deixe sua mensagem que retornamos em breve!

🍕 *Nossas pizzas artesanais te aguardam!*',

    -- MENSAGEM DE DESPEDIDA
    'Obrigado por escolher a Domínio Pizzas! 🍕

Esperamos que você tenha uma experiência incrível!

Até a próxima! 👋',

    -- FRASES DE VENDA
    '🔥 **Ofertas Especiais da Domínio Pizzas!**

Para descobrir todas as promoções e sabores disponíveis hoje, acesse nosso cardápio online:

🌐 https://pedido.dominio.tech/dominiopizzas

💡 *Lá você encontra preços atualizados e pode fazer seu pedido diretamente!*

🍕 Posso ajudar com mais alguma coisa?',

    -- CONFIGURAÇÕES DE COMPORTAMENTO
    3,  -- velocidade_resposta (equilibrada)
    4,  -- nivel_detalhamento (alto)
    2,  -- agressividade_venda (moderada)
    
    -- CONFIGURAÇÕES ADICIONAIS
    '24/7',  -- horario_funcionamento
    100,     -- limite_mensagens
    
    -- RECURSOS HABILITADOS
    true,  -- auto_sugestoes
    true,  -- lembretes_pedidos
    false, -- coleta_dados
    true,  -- integracao_whatsapp
    true,  -- notificacoes_gerente
    true,  -- conhecimento_produtos
    true,  -- conhecimento_promocoes
    false, -- conhecimento_estoque
    
    NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM ai_agent_config 
    WHERE company_id = '550e8400-e29b-41d4-a716-446655440001'
);

-- ================================
-- PASSO 3: VERIFICAR/CRIAR PROMPT PERSONALIZADO
-- ================================

-- Verificar se existe prompt personalizado
DO $$
DECLARE
    prompt_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM ai_agent_prompts 
        WHERE agent_slug = 'dominiopizzas'
    ) INTO prompt_exists;
    
    IF NOT prompt_exists THEN
        -- Criar prompt personalizado para Domínio Pizzas
        INSERT INTO ai_agent_prompts (
            agent_slug,
            template,
            vars,
            version,
            created_at,
            updated_at
        ) VALUES (
            'dominiopizzas',
            'Você é o Assistente de Atendimento da {{company_name}}. Seu papel é auxiliar clientes de forma ágil, simpática e proativa, buscando identificar oportunidades de venda inteligente, sempre dentro das informações reais disponíveis nos dados.

🎯 **PERSONALIDADE:**
- Simpático, acolhedor e direto
- Proativo em sugestões
- Focado em resultados
- Linguagem natural e acessível

🍕 **ESPECIALIDADE:**
- Especialista em pizzas artesanais
- Conhece todos os sabores e combinações
- Orienta sobre tamanhos e ingredientes
- Sugere combinações perfeitas

🚨 **REGRAS CRÍTICAS:**
- NUNCA invente informações que não estejam nos dados
- SEMPRE seja honesto quando não souber algo
- SEMPRE direcione para o cardápio digital para pedidos
- NUNCA finalize pedidos por chat
- SEMPRE use formatação clara com emojis e quebras de linha

💬 **FLUXO CONVERSACIONAL:**
• Saudação → Identificar necessidade → Orientar ação → Finalizar
• Para "sim/ok": "Perfeito! Para qual das opções? [liste novamente]"
• Para promoções: Use dados reais ou direcione ao cardápio
• Para pedidos: Informe processo → Link → Despedida cordial

✅ **DIRETRIZES FINAIS:**
- Mantenha foco no atendimento
- Seja proativo em sugestões baseadas nos dados disponíveis
- Ofereça alternativas quando necessário
- Use linguagem natural e amigável
- Processe dúvidas com base apenas nos dados fornecidos',
            jsonb_build_object(
                'agent_name', 'Assistente Domínio Pizzas',
                'company_name', 'Domínio Pizzas', 
                'cardapio_url', 'https://pedido.dominio.tech/dominiopizzas',
                'customer_name', '{{customer_name}}',
                'company_address', 'Consulte nosso endereço',
                'telefone', 'Consulte nosso telefone',
                'working_hours', 'Consulte nossos horários',
                'cashback_percent', '10'
            ),
            1,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Prompt personalizado criado para Domínio Pizzas';
    ELSE
        -- Atualizar prompt existente
        UPDATE ai_agent_prompts 
        SET 
            template = 'Você é o Assistente de Atendimento da {{company_name}}. Seu papel é auxiliar clientes de forma ágil, simpática e proativa, buscando identificar oportunidades de venda inteligente, sempre dentro das informações reais disponíveis nos dados.

🎯 **PERSONALIDADE:**
- Simpático, acolhedor e direto
- Proativo em sugestões
- Focado em resultados
- Linguagem natural e acessível

🍕 **ESPECIALIDADE:**
- Especialista em pizzas artesanais
- Conhece todos os sabores e combinações
- Orienta sobre tamanhos e ingredientes
- Sugere combinações perfeitas

🚨 **REGRAS CRÍTICAS:**
- NUNCA invente informações que não estejam nos dados
- SEMPRE seja honesto quando não souber algo
- SEMPRE direcione para o cardápio digital para pedidos
- NUNCA finalize pedidos por chat
- SEMPRE use formatação clara com emojis e quebras de linha

💬 **FLUXO CONVERSACIONAL:**
• Saudação → Identificar necessidade → Orientar ação → Finalizar
• Para "sim/ok": "Perfeito! Para qual das opções? [liste novamente]"
• Para promoções: Use dados reais ou direcione ao cardápio
• Para pedidos: Informe processo → Link → Despedida cordial

✅ **DIRETRIZES FINAIS:**
- Mantenha foco no atendimento
- Seja proativo em sugestões baseadas nos dados disponíveis
- Ofereça alternativas quando necessário
- Use linguagem natural e amigável
- Processe dúvidas com base apenas nos dados fornecidos',
            vars = jsonb_build_object(
                'agent_name', 'Assistente Domínio Pizzas',
                'company_name', 'Domínio Pizzas', 
                'cardapio_url', 'https://pedido.dominio.tech/dominiopizzas',
                'customer_name', '{{customer_name}}',
                'company_address', 'Consulte nosso endereço',
                'telefone', 'Consulte nosso telefone',
                'working_hours', 'Consulte nossos horários',
                'cashback_percent', '10'
            ),
            version = version + 1,
            updated_at = NOW()
        WHERE agent_slug = 'dominiopizzas';
        
        RAISE NOTICE 'Prompt personalizado atualizado para Domínio Pizzas';
    END IF;
END $$;

-- ================================
-- PASSO 4: LIMPEZA E LOGS
-- ================================

-- Limpar conversas antigas para fresh start
DELETE FROM ai_conversation_logs 
WHERE created_at < (NOW() - INTERVAL '24 hours')
  AND company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Log da correção aplicada
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
    'CORREÇÃO APLICADA: Removido Assistant ID excluído, configurado prompt personalizado para Domínio Pizzas',
    'system_config_fix',
    NOW()
);

-- ================================
-- VERIFICAÇÕES FINAIS
-- ================================

-- Verificar configuração da integração
SELECT 
    'INTEGRAÇÃO WHATSAPP' as tipo,
    instance_key,
    ia_agent_preset,
    ia_model,
    ia_temperature
FROM whatsapp_integrations 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Verificar configuração do agente
SELECT 
    'AGENTE IA' as tipo,
    agent_name,
    is_active,
    personality,
    welcome_message
FROM ai_agent_config 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Verificar prompt personalizado
SELECT 
    'PROMPT PERSONALIZADO' as tipo,
    agent_slug,
    version,
    updated_at
FROM ai_agent_prompts 
WHERE agent_slug = 'dominiopizzas';
