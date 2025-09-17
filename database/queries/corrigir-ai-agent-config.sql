-- Script de Correção: Garantir que a tabela ai_agent_config existe
-- Execute este script no SQL Editor do Supabase para corrigir o erro 404

-- ==============================================
-- 1. CRIAR TABELA AI_AGENT_CONFIG (se não existir)
-- ==============================================

CREATE TABLE IF NOT EXISTS ai_agent_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT false,
  agent_name VARCHAR(100) DEFAULT 'Atendente Virtual',
  personality VARCHAR(50) DEFAULT 'simpatico',
  language VARCHAR(10) DEFAULT 'pt-br',
  
  -- Mensagens personalizadas
  welcome_message TEXT DEFAULT 'Olá! Como posso te ajudar hoje?',
  away_message TEXT DEFAULT 'No momento estou ocupado, mas retorno em breve!',
  goodbye_message TEXT DEFAULT 'Obrigado pelo contato! Tenha um ótimo dia!',
  sales_phrases TEXT DEFAULT 'Confira nossos destaques! Posso te sugerir algo especial?',
  
  -- Configurações de comportamento
  response_speed INTEGER DEFAULT 2, -- 1-5 (lento a rápido)
  detail_level INTEGER DEFAULT 3, -- 1-5 (básico a detalhado)
  sales_aggressiveness INTEGER DEFAULT 2, -- 1-5 (sutil a agressivo)
  working_hours VARCHAR(20) DEFAULT '24/7',
  message_limit INTEGER DEFAULT 50,
  
  -- Recursos habilitados
  auto_suggestions BOOLEAN DEFAULT true,
  order_reminders BOOLEAN DEFAULT true,
  data_collection BOOLEAN DEFAULT false,
  whatsapp_integration BOOLEAN DEFAULT false,
  manager_notifications BOOLEAN DEFAULT true,
  
  -- Base de conhecimento
  product_knowledge BOOLEAN DEFAULT true,
  promotion_knowledge BOOLEAN DEFAULT true,
  stock_knowledge BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(company_id)
);

-- ==============================================
-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_ai_agent_config_company_id ON ai_agent_config(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_config_active ON ai_agent_config(is_active);

-- ==============================================
-- 3. CONFIGURAR RLS (Row Level Security)
-- ==============================================

ALTER TABLE ai_agent_config ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Companies can manage their AI config" ON ai_agent_config;
DROP POLICY IF EXISTS "Super admin can manage all ai agent configs" ON ai_agent_config;
DROP POLICY IF EXISTS "Company users can manage their ai agent configs" ON ai_agent_config;
DROP POLICY IF EXISTS "Allow all operations on ai_agent_config" ON ai_agent_config;

-- Criar políticas mais simples e funcionais
CREATE POLICY "Super admins can manage all AI agent configs"
ON ai_agent_config
FOR ALL
TO authenticated
USING (
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
)
WITH CHECK (
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
);

CREATE POLICY "Company users can manage their AI agent configs"
ON ai_agent_config
FOR ALL
TO authenticated
USING (
    company_id IN (
        SELECT id FROM companies 
        WHERE domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain')
    )
)
WITH CHECK (
    company_id IN (
        SELECT id FROM companies 
        WHERE domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain')
    )
);

-- ==============================================
-- 4. MIGRAR DADOS DA TABELA ANTIGA (se existir)
-- ==============================================

-- Migrar dados de agente_ia_config para ai_agent_config (se a tabela antiga existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agente_ia_config') THEN
        -- Inserir dados da tabela antiga na nova (apenas se não existirem)
        INSERT INTO ai_agent_config (
            company_id,
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
            auto_suggestions,
            product_knowledge,
            promotion_knowledge,
            stock_knowledge,
            is_active,
            message_limit,
            order_reminders,
            data_collection,
            whatsapp_integration,
            manager_notifications
        )
        SELECT 
            company_id,
            nome as agent_name,
            personalidade as personality,
            idioma as language,
            mensagem_boas_vindas as welcome_message,
            mensagem_ausencia as away_message,
            mensagem_despedida as goodbye_message,
            frases_venda as sales_phrases,
            velocidade_resposta as response_speed,
            nivel_detalhamento as detail_level,
            agressividade_venda as sales_aggressiveness,
            horario_funcionamento as working_hours,
            auto_sugestoes as auto_suggestions,
            conhecimento_produtos as product_knowledge,
            conhecimento_promocoes as promotion_knowledge,
            conhecimento_estoque as stock_knowledge,
            ativo as is_active,
            limite_mensagens as message_limit,
            lembranca_pedidos as order_reminders,
            coleta_dados as data_collection,
            integracao_whatsapp as whatsapp_integration,
            notificacao_gerente as manager_notifications
        FROM agente_ia_config
        WHERE company_id NOT IN (SELECT company_id FROM ai_agent_config);
        
        RAISE NOTICE 'Dados migrados de agente_ia_config para ai_agent_config';
    END IF;
END $$;

-- ==============================================
-- 5. VERIFICAÇÃO FINAL
-- ==============================================

DO $$
DECLARE
    table_count INTEGER;
    record_count INTEGER;
BEGIN
    -- Verificar se a tabela foi criada
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_name = 'ai_agent_config' AND table_schema = 'public';
    
    IF table_count > 0 THEN
        RAISE NOTICE '✅ Tabela ai_agent_config existe';
        
        -- Contar registros
        SELECT COUNT(*) INTO record_count FROM ai_agent_config;
        RAISE NOTICE '📊 Registros na tabela: %', record_count;
        
        -- Verificar políticas RLS
        SELECT COUNT(*) INTO table_count
        FROM pg_policies 
        WHERE tablename = 'ai_agent_config';
        RAISE NOTICE '🔒 Políticas RLS configuradas: %', table_count;
        
        RAISE NOTICE '';
        RAISE NOTICE '🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!';
        RAISE NOTICE '';
        RAISE NOTICE '✅ A tabela ai_agent_config está funcionando corretamente';
        RAISE NOTICE '✅ O erro 404 deve estar resolvido';
        RAISE NOTICE '✅ Você pode acessar a configuração do agente IA normalmente';
        
    ELSE
        RAISE EXCEPTION '❌ Erro: Tabela ai_agent_config não foi criada';
    END IF;
END $$;