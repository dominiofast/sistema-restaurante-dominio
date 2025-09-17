-- 🔧 CORREÇÃO LOOP AGENTE IA - VERSÃO CORRIGIDA
-- Execute este script no SQL Editor do Supabase

-- ================================
-- PASSO 1: CORRIGIR CONFIGURAÇÃO GLOBAL
-- ================================

UPDATE ai_global_config 
SET 
    max_tokens = 500,
    temperature = 0.4,
    system_prompt = 'Você é um atendente virtual especializado em atendimento ao cliente.

REGRAS ANTI-LOOP:
1. NUNCA repita exatamente a mesma resposta
2. SEMPRE forneça informações específicas 
3. SEMPRE avance na conversa oferecendo opções claras
4. Se cliente pergunta sobre promoções, mencione produtos e preços
5. Se cliente diz "sim", pergunte especificamente o que ele quer

COMPORTAMENTO:
- Seja específico, não genérico
- Ofereça opções concretas
- Use dados reais da empresa  
- Mantenha contexto da conversa
- Progrida sempre para próxima etapa'
WHERE is_active = true;

-- Verificar se atualizou
SELECT 'CONFIGURAÇÃO GLOBAL ATUALIZADA' as status, max_tokens, temperature 
FROM ai_global_config WHERE is_active = true;

-- ================================
-- PASSO 2: CONFIGURAR COOKIELAB
-- ================================

-- Encontrar empresa Cookielab e configurar
DO $$
DECLARE
    cookielab_id UUID;
BEGIN
    SELECT id INTO cookielab_id 
    FROM companies 
    WHERE name ILIKE '%cookielab%' OR domain ILIKE '%cookielab%' OR slug ILIKE '%cookielab%'
    LIMIT 1;
    
    IF cookielab_id IS NOT NULL THEN
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
        ) VALUES (
            cookielab_id,
            true,
            'Atendente Cookielab',
            'simpatico',
            'Olá! Bem-vindo à Cookielab! 🍪 Somos especializados em cookies artesanais deliciosos. 

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
        )
        ON CONFLICT (company_id) 
        DO UPDATE SET
            nome = EXCLUDED.nome,
            mensagem_boas_vindas = EXCLUDED.mensagem_boas_vindas,
            frases_venda = EXCLUDED.frases_venda,
            nivel_detalhamento = EXCLUDED.nivel_detalhamento,
            conhecimento_produtos = true,
            conhecimento_promocoes = true,
            updated_at = NOW();
    END IF;
END $$;

-- ================================
-- PASSO 3: CRIAR PRODUTOS EXEMPLO
-- ================================

DO $$
DECLARE
    cookielab_id UUID;
    categoria_id UUID;
BEGIN
    SELECT id INTO cookielab_id 
    FROM companies 
    WHERE name ILIKE '%cookielab%' 
    LIMIT 1;
    
    IF cookielab_id IS NOT NULL THEN
        -- Criar categoria
        INSERT INTO categorias (name, company_id, sort_order, is_active)
        VALUES ('Cookies Especiais', cookielab_id, 1, true)
        ON CONFLICT DO NOTHING;
        
        SELECT id INTO categoria_id 
        FROM categorias 
        WHERE company_id = cookielab_id 
        LIMIT 1;
        
        -- Criar produtos se categoria existe
        IF categoria_id IS NOT NULL THEN
            INSERT INTO produtos (name, description, price, promotional_price, is_promotional, company_id, categoria_id, is_available, destaque)
            VALUES 
            ('Cookie Chocolate Duplo', 'Cookie especial com chocolate branco e ao leite', 12.90, 9.90, true, cookielab_id, categoria_id, true, true),
            ('Cookie Red Velvet', 'Cookie aveludado com cream cheese', 11.90, 8.90, true, cookielab_id, categoria_id, true, true),
            ('Cookie Tradicional', 'Clássico cookie com gotas de chocolate', 8.90, null, false, cookielab_id, categoria_id, true, false),
            ('Combo Cookie + Café', 'Cookie especial + café expresso', 18.90, 14.90, true, cookielab_id, categoria_id, true, true)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;

-- ================================
-- PASSO 4: LIMPAR CONVERSAS ANTIGAS
-- ================================

DELETE FROM ai_conversation_logs 
WHERE created_at < (NOW() - INTERVAL '1 hour')
  AND company_id IN (SELECT id FROM companies WHERE name ILIKE '%cookielab%');

-- ================================
-- VERIFICAÇÕES FINAIS
-- ================================

-- Verificar configuração da Cookielab
SELECT 
    'CONFIGURAÇÃO COOKIELAB' as info,
    c.name as empresa,
    aic.nome as agente_nome,
    aic.nivel_detalhamento,
    aic.conhecimento_produtos,
    LENGTH(aic.mensagem_boas_vindas) as tamanho_boas_vindas
FROM companies c
JOIN agente_ia_config aic ON aic.company_id = c.id
WHERE c.name ILIKE '%cookielab%';

-- Verificar produtos
SELECT 
    'PRODUTOS COOKIELAB' as info,
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN is_promotional THEN 1 END) as em_promocao
FROM produtos p
JOIN companies c ON c.id = p.company_id
WHERE c.name ILIKE '%cookielab%' AND p.is_available = true;

-- Resultado final
SELECT '🎉 CORREÇÃO APLICADA COM SUCESSO!' as resultado;
SELECT 'Teste agora uma nova conversa no WhatsApp' as proxima_acao; 