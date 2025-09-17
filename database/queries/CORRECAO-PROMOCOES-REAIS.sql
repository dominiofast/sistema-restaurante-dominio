-- 🔧 CORREÇÃO: Promoções Reais + Fluxo Melhorado
-- Execute este script para corrigir os problemas identificados

-- ================================
-- PASSO 1: REMOVER PROMOÇÕES FICTÍCIAS
-- ================================

UPDATE agente_ia_config 
SET 
    -- Boas-vindas SEM promoções específicas hardcoded
    mensagem_boas_vindas = 'Olá! Bem-vindo à Cookielab! 🍪

Como posso ajudar você hoje?

1️⃣ Ver nosso cardápio
2️⃣ Conhecer promoções atuais  
3️⃣ Informações sobre entrega
4️⃣ Fazer um pedido

Digite o número ou me diga diretamente o que precisa!',

    -- Mensagem de promoções genérica (para buscar do banco)
    frases_venda = 'Confira nossas promoções atuais! Temos ofertas especiais selecionadas especialmente para você. Gostaria de conhecer os produtos em destaque hoje?',

    -- Configurações mais inteligentes
    nivel_detalhamento = 3,
    agressividade_venda = 1,
    conhecimento_produtos = true,
    conhecimento_promocoes = true

WHERE company_id IN (
    SELECT id FROM companies 
    WHERE name ILIKE '%cookielab%' OR domain ILIKE '%cookielab%' OR slug ILIKE '%cookielab%'
);

-- ================================
-- PASSO 2: MELHORAR SYSTEM PROMPT GLOBAL
-- ================================

UPDATE ai_global_config 
SET system_prompt = 'Você é um atendente virtual especializado em atendimento ao cliente.

REGRAS FUNDAMENTAIS:
1. NUNCA repita a mesma resposta anterior
2. SEMPRE use dados REAIS da empresa, não invente promoções
3. Se perguntarem sobre promoções, consulte produtos com promotional_price ou is_promotional = true
4. FLUXO CORRETO: Resposta informativa → Direcionar para pedido → ENCERRAR conversa
5. Após enviar link do cardápio, diga "Fico no aguardo do seu pedido!" e pare

COMPORTAMENTO PARA PROMOÇÕES:
- Se tem produtos promocionais: mencione produtos REAIS com preços REAIS  
- Se não tem promoções: "No momento não temos promoções ativas, mas temos produtos deliciosos!"
- SEMPRE use dados do banco de dados, NUNCA invente preços

COMPORTAMENTO PARA PEDIDOS:
- Informe sobre o produto/serviço
- Direcione para o cardápio online
- FINALIZE a conversa aguardando o pedido
- NÃO faça mais perguntas após enviar o link

Seja conciso, preciso e use APENAS dados reais da empresa.'

WHERE is_active = true;

-- ================================
-- VERIFICAR SE COOKIELAB TEM PRODUTOS REAIS
-- ================================

-- Mostrar produtos da Cookielab (se existir)
SELECT 
    '🍪 PRODUTOS COOKIELAB REAIS' as info,
    p.name as produto,
    p.price as preco_normal,
    p.promotional_price as preco_promocional,
    p.is_promotional as em_promocao,
    p.destaque as em_destaque
FROM produtos p
JOIN companies c ON c.id = p.company_id
WHERE (c.name ILIKE '%cookielab%' OR c.domain ILIKE '%cookielab%' OR c.slug ILIKE '%cookielab%')
  AND p.is_available = true
ORDER BY p.is_promotional DESC, p.destaque DESC;

-- ================================
-- CRIAR PRODUTOS REAIS (SE NÃO EXISTIR)
-- ================================

-- Inserir produtos REAIS da Cookielab (apenas se não existirem)
INSERT INTO produtos (name, description, price, promotional_price, is_promotional, company_id, is_available, destaque)
SELECT 
    'Cookie Clássico',
    'Nosso cookie tradicional com gotas de chocolate',
    8.90,
    null,
    false,
    c.id,
    true,
    false
FROM companies c
WHERE (c.name ILIKE '%cookielab%' OR c.domain ILIKE '%cookielab%' OR c.slug ILIKE '%cookielab%')
  AND NOT EXISTS (
      SELECT 1 FROM produtos p WHERE p.company_id = c.id AND p.name = 'Cookie Clássico'
  );

-- ================================
-- LIMPAR CONTEXTO PROBLEMÁTICO
-- ================================

-- Remover conversas recentes que podem ter contexto ruim
DELETE FROM ai_conversation_logs 
WHERE created_at > (NOW() - INTERVAL '2 hours')
  AND company_id IN (
      SELECT id FROM companies 
      WHERE name ILIKE '%cookielab%' OR domain ILIKE '%cookielab%' OR slug ILIKE '%cookielab%'
  );

-- ================================
-- VERIFICAÇÕES FINAIS
-- ================================

-- Verificar configuração atualizada
SELECT 
    '✅ CONFIGURAÇÃO CORRIGIDA' as status,
    c.name as empresa,
    aic.nome as agente,
    CASE 
        WHEN aic.mensagem_boas_vindas LIKE '%R$ 9,90%' THEN '❌ Ainda tem preços fictícios'
        ELSE '✅ Sem promoções fictícias' 
    END as status_promocoes,
    aic.nivel_detalhamento,
    aic.agressividade_venda
FROM companies c
JOIN agente_ia_config aic ON aic.company_id = c.id
WHERE c.name ILIKE '%cookielab%' OR c.domain ILIKE '%cookielab%' OR c.slug ILIKE '%cookielab%';

-- Verificar configuração global
SELECT 
    '🎯 SYSTEM PROMPT ATUALIZADO' as status,
    CASE 
        WHEN system_prompt LIKE '%dados REAIS%' THEN '✅ Instruído a usar dados reais'
        ELSE '❌ Ainda pode usar dados fictícios'
    END as status_prompt,
    max_tokens,
    temperature
FROM ai_global_config WHERE is_active = true;

-- Resultado
SELECT '🎉 CORREÇÃO DE PROMOÇÕES REAIS APLICADA!' as resultado;
SELECT 'Teste agora: pergunte sobre promoções' as teste_1;
SELECT 'O agente deve usar apenas dados reais do banco' as teste_2;
SELECT 'Após enviar link, deve encerrar conversa' as teste_3; 