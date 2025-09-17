-- Criar tabela para rate limiting de emails
CREATE TABLE IF NOT EXISTS public.email_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  request_type TEXT NOT NULL, -- 'password_reset', 'email_confirmation'
  request_count INTEGER DEFAULT 1,
  first_request_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_request_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_email_rate_limits_email ON public.email_rate_limits(email);
CREATE INDEX IF NOT EXISTS idx_email_rate_limits_type ON public.email_rate_limits(request_type);
CREATE INDEX IF NOT EXISTS idx_email_rate_limits_blocked ON public.email_rate_limits(blocked_until);

-- RLS para segurança
ALTER TABLE public.email_rate_limits ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver os rate limits
CREATE POLICY "Super admins can view rate limits" ON public.email_rate_limits
FOR SELECT USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'super_admin'
);

-- Função para verificar rate limit
CREATE OR REPLACE FUNCTION public.check_email_rate_limit(
  user_email TEXT,
  req_type TEXT DEFAULT 'password_reset',
  max_requests INTEGER DEFAULT 5,
  time_window_minutes INTEGER DEFAULT 60
) RETURNS JSONB AS $$
DECLARE
  current_record RECORD;
  time_cutoff TIMESTAMP WITH TIME ZONE;
  result JSONB;
BEGIN
  -- Calcular janela de tempo
  time_cutoff := NOW() - INTERVAL '1 minute' * time_window_minutes;
  
  -- Buscar registro existente
  SELECT * INTO current_record 
  FROM public.email_rate_limits 
  WHERE email = user_email AND request_type = req_type;
  
  -- Se não existe registro, criar
  IF NOT FOUND THEN
    INSERT INTO public.email_rate_limits (email, request_type, request_count)
    VALUES (user_email, req_type, 1);
    
    RETURN jsonb_build_object(
      'allowed', true,
      'requests_remaining', max_requests - 1,
      'reset_at', NOW() + INTERVAL '1 minute' * time_window_minutes
    );
  END IF;
  
  -- Se está bloqueado e ainda não expirou
  IF current_record.blocked_until IS NOT NULL AND current_record.blocked_until > NOW() THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'blocked',
      'blocked_until', current_record.blocked_until,
      'requests_remaining', 0
    );
  END IF;
  
  -- Se a janela de tempo passou, resetar contador
  IF current_record.first_request_at < time_cutoff THEN
    UPDATE public.email_rate_limits 
    SET 
      request_count = 1,
      first_request_at = NOW(),
      last_request_at = NOW(),
      blocked_until = NULL,
      updated_at = NOW()
    WHERE email = user_email AND request_type = req_type;
    
    RETURN jsonb_build_object(
      'allowed', true,
      'requests_remaining', max_requests - 1,
      'reset_at', NOW() + INTERVAL '1 minute' * time_window_minutes
    );
  END IF;
  
  -- Se ainda está dentro da janela, verificar limite
  IF current_record.request_count >= max_requests THEN
    -- Bloquear por 30 minutos
    UPDATE public.email_rate_limits 
    SET 
      blocked_until = NOW() + INTERVAL '30 minutes',
      updated_at = NOW()
    WHERE email = user_email AND request_type = req_type;
    
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'rate_limit_exceeded',
      'blocked_until', NOW() + INTERVAL '30 minutes',
      'requests_remaining', 0
    );
  END IF;
  
  -- Incrementar contador
  UPDATE public.email_rate_limits 
  SET 
    request_count = request_count + 1,
    last_request_at = NOW(),
    updated_at = NOW()
  WHERE email = user_email AND request_type = req_type;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'requests_remaining', max_requests - (current_record.request_count + 1),
    'reset_at', current_record.first_request_at + INTERVAL '1 minute' * time_window_minutes
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tabela para logs de emails
CREATE TABLE IF NOT EXISTS public.email_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  status TEXT NOT NULL, -- 'sent', 'failed', 'blocked'
  provider TEXT DEFAULT 'resend',
  message_id TEXT,
  error_details JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_email_audit_logs_email ON public.email_audit_logs(email);
CREATE INDEX IF NOT EXISTS idx_email_audit_logs_type ON public.email_audit_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_audit_logs_created ON public.email_audit_logs(created_at);

-- RLS para logs
ALTER TABLE public.email_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view email logs" ON public.email_audit_logs
FOR SELECT USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'super_admin'
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_email_rate_limits_updated_at
BEFORE UPDATE ON public.email_rate_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();