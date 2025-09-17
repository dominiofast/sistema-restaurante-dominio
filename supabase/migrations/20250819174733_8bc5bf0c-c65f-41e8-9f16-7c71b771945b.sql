-- Criar tabela para sessões de autoatendimento
CREATE TABLE public.autoatendimento_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  session_token VARCHAR(32) NOT NULL UNIQUE,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  cart_data JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'cancelled')),
  timeout_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  order_id INTEGER REFERENCES public.pedidos(id)
);

-- Habilitar RLS
ALTER TABLE public.autoatendimento_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Public can create sessions" ON public.autoatendimento_sessions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update their sessions" ON public.autoatendimento_sessions
FOR UPDATE USING (true);

CREATE POLICY "Public can view their sessions" ON public.autoatendimento_sessions
FOR SELECT USING (true);

-- Índices para performance
CREATE INDEX idx_autoatendimento_sessions_company ON public.autoatendimento_sessions(company_id);
CREATE INDEX idx_autoatendimento_sessions_token ON public.autoatendimento_sessions(session_token);
CREATE INDEX idx_autoatendimento_sessions_status ON public.autoatendimento_sessions(status);
CREATE INDEX idx_autoatendimento_sessions_timeout ON public.autoatendimento_sessions(timeout_at);

-- Função para limpeza automática de sessões expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_autoatendimento_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.autoatendimento_sessions 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' AND timeout_at < NOW();
END;
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_autoatendimento_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_autoatendimento_sessions_updated_at
    BEFORE UPDATE ON public.autoatendimento_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_autoatendimento_sessions_updated_at();

-- Configuração de autoatendimento por empresa
CREATE TABLE public.autoatendimento_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT true,
  session_timeout_minutes INTEGER DEFAULT 10,
  welcome_message TEXT DEFAULT 'Bem-vindo! Faça seu pedido de forma rápida e fácil.',
  show_preparation_time BOOLEAN DEFAULT true,
  require_customer_data BOOLEAN DEFAULT true,
  allow_cash_payment BOOLEAN DEFAULT true,
  allow_card_payment BOOLEAN DEFAULT true,
  allow_pix_payment BOOLEAN DEFAULT true,
  kiosk_mode BOOLEAN DEFAULT true,
  auto_print_orders BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.autoatendimento_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Company manage autoatendimento config" ON public.autoatendimento_config
FOR ALL USING ((company_id = get_user_company_id()) OR (get_user_role() = 'super_admin'));

CREATE POLICY "Public can view autoatendimento config" ON public.autoatendimento_config
FOR SELECT USING (is_enabled = true);

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_autoatendimento_config_updated_at
    BEFORE UPDATE ON public.autoatendimento_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();