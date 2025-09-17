-- Configuração global de IA (apenas super admin)
CREATE TABLE IF NOT EXISTS ai_global_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openai_api_key TEXT NOT NULL,
  openai_model VARCHAR(50) DEFAULT 'gpt-3.5-turbo',
  max_tokens INTEGER DEFAULT 150,
  temperature DECIMAL(2,1) DEFAULT 0.7,
  system_prompt TEXT DEFAULT 'Você é um assistente virtual especializado em atendimento ao cliente para restaurantes e estabelecimentos comerciais.',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuração de agente IA por empresa
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

-- Logs de conversas da IA
CREATE TABLE IF NOT EXISTS ai_conversation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_phone VARCHAR(20),
  customer_name VARCHAR(100),
  message_type VARCHAR(20) NOT NULL, -- 'user' ou 'assistant'
  message_content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_agent_config_company_id ON ai_agent_config(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_logs_company_id ON ai_conversation_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_logs_created_at ON ai_conversation_logs(created_at);

-- RLS (Row Level Security)
ALTER TABLE ai_global_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Apenas super admin pode acessar configuração global
CREATE POLICY "Super admin can manage global AI config" ON ai_global_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- Empresas podem gerenciar apenas suas próprias configurações
CREATE POLICY "Companies can manage their AI config" ON ai_agent_config
  FOR ALL USING (
    company_id IN (
      SELECT c.id FROM companies c
      JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain
      WHERE u.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- Logs de conversa por empresa
CREATE POLICY "Companies can view their conversation logs" ON ai_conversation_logs
  FOR SELECT USING (
    company_id IN (
      SELECT c.id FROM companies c
      JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain
      WHERE u.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- Inserir configuração global padrão (será atualizada pelo super admin)
INSERT INTO ai_global_config (openai_api_key, is_active) 
VALUES ('CONFIGURE_YOUR_OPENAI_API_KEY_HERE', false)
ON CONFLICT DO NOTHING;
