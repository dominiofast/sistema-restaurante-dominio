-- Tabela para configurações de modelo AI
CREATE TABLE public.ai_model_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  model VARCHAR(100) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  api_key TEXT,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2000,
  top_p DECIMAL(3,2) DEFAULT 1.0,
  frequency_penalty DECIMAL(3,2) DEFAULT 0.0,
  presence_penalty DECIMAL(3,2) DEFAULT 0.0,
  streaming BOOLEAN DEFAULT true,
  timeout_seconds INTEGER DEFAULT 30,
  retry_attempts INTEGER DEFAULT 3,
  system_prompt TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para templates de prompts
CREATE TABLE public.prompt_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  content TEXT NOT NULL,
  version VARCHAR(20) DEFAULT '1.0',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para dados de uso e analytics
CREATE TABLE public.ai_usage_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  requests INTEGER DEFAULT 0,
  tokens INTEGER DEFAULT 0,
  cost DECIMAL(10,2) DEFAULT 0.0,
  latency_ms INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.0,
  provider VARCHAR(50),
  model VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, date, provider, model)
);

-- Tabela para configurações de rate limiting
CREATE TABLE public.ai_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  requests_per_minute INTEGER DEFAULT 100,
  tokens_per_month INTEGER DEFAULT 1000000,
  cost_threshold DECIMAL(10,2) DEFAULT 500.0,
  alerts_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações de segurança
CREATE TABLE public.ai_security_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  content_moderation BOOLEAN DEFAULT true,
  prohibited_words TEXT[], -- Array de palavras proibidas
  log_sensitive_conversations BOOLEAN DEFAULT true,
  data_retention_days INTEGER DEFAULT 90,
  privacy_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para logs de segurança
CREATE TABLE public.ai_security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL, -- 'content_blocked', 'rate_limit_exceeded', 'backup_completed', etc
  severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
  description TEXT NOT NULL,
  user_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações de webhook
CREATE TABLE public.ai_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- Array de eventos: 'request_completed', 'rate_limit_exceeded', etc
  is_active BOOLEAN DEFAULT true,
  secret_key VARCHAR(255),
  retry_attempts INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações de fallback
CREATE TABLE public.ai_fallback_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  primary_model VARCHAR(100) NOT NULL,
  secondary_model VARCHAR(100),
  tertiary_model VARCHAR(100),
  fallback_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações de cache
CREATE TABLE public.ai_cache_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  cache_enabled BOOLEAN DEFAULT true,
  ttl_minutes INTEGER DEFAULT 30,
  max_size_mb INTEGER DEFAULT 500,
  cache_similar_prompts BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações de backup
CREATE TABLE public.ai_backup_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  auto_backup_enabled BOOLEAN DEFAULT true,
  frequency VARCHAR(20) DEFAULT 'daily', -- 'hourly', 'daily', 'weekly', 'monthly'
  retention_days INTEGER DEFAULT 30,
  last_backup_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para testes A/B de prompts
CREATE TABLE public.prompt_ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  prompt_a_id UUID REFERENCES public.prompt_templates(id),
  prompt_b_id UUID REFERENCES public.prompt_templates(id),
  traffic_split DECIMAL(3,2) DEFAULT 0.5, -- 0.5 = 50/50
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'running', 'completed', 'paused'
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  winner_prompt_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_ai_model_configs_company_id ON public.ai_model_configs(company_id);
CREATE INDEX idx_prompt_templates_company_id ON public.prompt_templates(company_id);
CREATE INDEX idx_ai_usage_analytics_company_date ON public.ai_usage_analytics(company_id, date);
CREATE INDEX idx_ai_security_logs_company_created ON public.ai_security_logs(company_id, created_at);

-- RLS Policies
ALTER TABLE public.ai_model_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_fallback_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_cache_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_backup_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_ab_tests ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para super admin
CREATE POLICY "Super admin can manage all AI configs" ON public.ai_model_configs
  FOR ALL USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Super admin can manage all prompt templates" ON public.prompt_templates
  FOR ALL USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Super admin can view all usage analytics" ON public.ai_usage_analytics
  FOR ALL USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Super admin can manage all rate limits" ON public.ai_rate_limits
  FOR ALL USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Super admin can manage all security settings" ON public.ai_security_settings
  FOR ALL USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Super admin can view all security logs" ON public.ai_security_logs
  FOR ALL USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Super admin can manage all webhooks" ON public.ai_webhooks
  FOR ALL USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Super admin can manage all fallback configs" ON public.ai_fallback_configs
  FOR ALL USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Super admin can manage all cache configs" ON public.ai_cache_configs
  FOR ALL USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Super admin can manage all backup configs" ON public.ai_backup_configs
  FOR ALL USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Super admin can manage all AB tests" ON public.prompt_ab_tests
  FOR ALL USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'super_admin'
  );

-- Triggers para updated_at
CREATE TRIGGER update_ai_model_configs_updated_at
  BEFORE UPDATE ON public.ai_model_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prompt_templates_updated_at
  BEFORE UPDATE ON public.prompt_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_rate_limits_updated_at
  BEFORE UPDATE ON public.ai_rate_limits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_security_settings_updated_at
  BEFORE UPDATE ON public.ai_security_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_webhooks_updated_at
  BEFORE UPDATE ON public.ai_webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_fallback_configs_updated_at
  BEFORE UPDATE ON public.ai_fallback_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_cache_configs_updated_at
  BEFORE UPDATE ON public.ai_cache_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_backup_configs_updated_at
  BEFORE UPDATE ON public.ai_backup_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prompt_ab_tests_updated_at
  BEFORE UPDATE ON public.prompt_ab_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();