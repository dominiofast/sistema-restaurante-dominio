-- 🔧 CORREÇÃO URGENTE: Agente IA em Loop
-- Execute este script no SQL Editor do Supabase IMEDIATAMENTE

-- ================================
-- PASSO 1: CORRIGIR CONFIGURAÇÃO GLOBAL
-- ================================

-- Atualizar configuração global para evitar loops
UPDATE ai_global_config 
SET 
    max_tokens = 500,
    temperature = 0.4,
    system_prompt = 'Você é um atendente virtual especializado em atendimento ao cliente.

REGRAS FUNDAMENTAIS ANTI-LOOP:
1. NUNCA repita exatamente a mesma resposta anterior
2. SEMPRE forneça informações específicas e concretas
3. SEMPRE avance na conversa oferecendo opções claras
4. Se cliente pergunta sobre promoções, mencione produtos e preços específicos
5. Se cliente diz "sim" ou "ok", pergunte especificamente o que ele quer saber

COMPORTAMENTO OBRIGATÓRIO:
- Seja específico, não genérico
- Ofereça opções concretas (ex: "1) Ver cardápio, 2) Saber sobre promoções, 3) Fazer pedido")
- Use dados reais da empresa quando disponíveis
- Mantenha contexto da conversa anterior
- Progrida sempre para a próxima etapa lógica'
WHERE is_active = true;

-- Verificar se atualizou
SELECT 'CONFIGURAÇÃO GLOBAL ATUALIZADA' as status, max_tokens, temperature 
FROM ai_global_config WHERE is_active = true;

-- ================================
-- PASSO 2: MELHORAR CONFIGURAÇÃO DA COOKIELAB
-- ================================

-- Encontrar empresa Cookielab
DO $$
DECLARE
    cookielab_id UUID;
BEGIN
    -- Buscar ID da Cookielab
    SELECT id INTO cookielab_id 
    FROM companies 
    WHERE name ILIKE '%cookielab%' OR domain ILIKE '%cookielab%' OR slug ILIKE '%cookielab%'
    LIMIT 1;
    
    IF cookielab_id IS NOT NULL THEN
        -- Atualizar ou criar configuração específica da Cookielab
        INSERT INTO agente_ia_config (
            company_id,
            ativo,
            nome,
            personalidade,
            mensagem_boas_vindas,
            mensagem_ausencia,
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
            'Olá! Bem-vindo à Cookielab! 🍪 Somos especializados em cookies artesanais deliciosos. Como posso ajudar você hoje? 

Posso te ajudar com:
1️⃣ Ver nossos cookies disponíveis
2️⃣ Saber sobre promoções ativas  
3️⃣ Informações sobre entrega
4️⃣ Fazer um pedido

Digite o número da opção ou me diga diretamente o que precisa!',
            'No momento nosso atendimento está ocupado, mas retornaremos em breve! Enquanto isso, você pode ver nosso cardápio completo.',
            'Experimente nossos cookies especiais! Temos promoções imperdíveis hoje:
• Cookie Chocolate Duplo - PROMOÇÃO 
• Combos especiais com desconto
• Cookies personalizados para eventos

Gostaria de conhecer os sabores disponíveis hoje?',
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
        
        RAISE NOTICE '✅ Configuração da Cookielab atualizada! ID: %', cookielab_id;
    ELSE
        RAISE NOTICE '⚠️ Empresa Cookielab não encontrada';
    END IF;
END $$;

-- ================================
-- PASSO 3: CRIAR PRODUTOS DE EXEMPLO (se não existir)
-- ================================

DO $$
DECLARE
    cookielab_id UUID;
    categoria_cookies_id UUID;
BEGIN
    -- Buscar empresa Cookielab
    SELECT id INTO cookielab_id 
    FROM companies 
    WHERE name ILIKE '%cookielab%' 
    LIMIT 1;
    
    IF cookielab_id IS NOT NULL THEN
        -- Criar categoria se não existir
        INSERT INTO categorias (name, company_id, sort_order, is_active)
        VALUES ('Cookies Especiais', cookielab_id, 1, true)
        ON CONFLICT DO NOTHING
        RETURNING id INTO categoria_cookies_id;
        
        -- Se não retornou ID, buscar existente
        IF categoria_cookies_id IS NULL THEN
            SELECT id INTO categoria_cookies_id 
            FROM categorias 
            WHERE company_id = cookielab_id AND name ILIKE '%cookie%' 
            LIMIT 1;
        END IF;
        
        -- Criar produtos de exemplo se categoria existe
        IF categoria_cookies_id IS NOT NULL THEN
            INSERT INTO produtos (name, description, price, promotional_price, is_promotional, company_id, categoria_id, is_available, destaque)
            VALUES 
            ('Cookie Chocolate Duplo', 'Cookie especial com chocolate branco e ao leite - uma explosão de sabor!', 12.90, 9.90, true, cookielab_id, categoria_cookies_id, true, true),
            ('Cookie Red Velvet', 'Cookie aveludado com cream cheese - irresistível!', 11.90, 8.90, true, cookielab_id, categoria_cookies_id, true, true),
            ('Cookie Tradicional', 'Nosso clássico cookie com gotas de chocolate', 8.90, null, false, cookielab_id, categoria_cookies_id, true, false),
            ('Combo Cookie + Café', 'Cookie especial + café expresso - perfeito para qualquer hora', 18.90, 14.90, true, cookielab_id, categoria_cookies_id, true, true)
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE '✅ Produtos de exemplo criados para Cookielab';
        END IF;
    END IF;
END $$;

-- ================================
-- PASSO 4: LIMPAR CONVERSAS ANTIGAS (RESET)
-- ================================

-- Remover conversas antigas que podem estar causando loop
DELETE FROM ai_conversation_logs 
WHERE created_at < (NOW() - INTERVAL '1 hour')
  AND company_id IN (SELECT id FROM companies WHERE name ILIKE '%cookielab%');

RAISE NOTICE '🧹 Conversas antigas removidas para evitar contexto problemático';

-- ================================
-- PASSO 5: VERIFICAÇÕES FINAIS
-- ================================

-- Verificar configuração final
SELECT 
    '🎯 CONFIGURAÇÃO FINAL' as info,
    c.name as empresa,
    aic.nome as agente_nome,
    aic.nivel_detalhamento,
    aic.conhecimento_produtos,
    aic.conhecimento_promocoes,
    LENGTH(aic.mensagem_boas_vindas) as tamanho_boas_vindas
FROM companies c
JOIN agente_ia_config aic ON aic.company_id = c.id
WHERE c.name ILIKE '%cookielab%';

-- Verificar produtos disponíveis
SELECT 
    '🍪 PRODUTOS DISPONÍVEIS' as info,
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN is_promotional THEN 1 END) as em_promocao,
    COUNT(CASE WHEN destaque THEN 1 END) as em_destaque
FROM produtos p
JOIN companies c ON c.id = p.company_id
WHERE c.name ILIKE '%cookielab%' AND p.is_available = true;

-- Verificar configuração global
SELECT 
    '⚙️ CONFIG GLOBAL' as info,
    max_tokens,
    temperature,
    CASE 
        WHEN LENGTH(system_prompt) > 200 THEN 'System prompt atualizado ✅'
        ELSE 'System prompt muito curto ❌'
    END as status_prompt
FROM ai_global_config WHERE is_active = true;

-- ================================
-- RESULTADO FINAL
-- ================================

SELECT '🎉 CORREÇÃO DE LOOP APLICADA COM SUCESSO!' as resultado;
SELECT 'Agora teste uma nova conversa no WhatsApp.' as instrucao;
SELECT 'O agente deve fornecer respostas específicas e não repetir.' as comportamento_esperado; 