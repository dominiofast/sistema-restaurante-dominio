-- Criar tabela para rate limiting de login
CREATE TABLE IF NOT EXISTS public.login_rate_limit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(255) NOT NULL, -- email ou IP
    identifier_type VARCHAR(50) NOT NULL, -- 'email' ou 'ip'
    attempts INTEGER DEFAULT 1,
    first_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_login_rate_limit_identifier ON public.login_rate_limit(identifier, identifier_type);
CREATE INDEX IF NOT EXISTS idx_login_rate_limit_blocked_until ON public.login_rate_limit(blocked_until) WHERE blocked_until IS NOT NULL;

-- RLS para segurança (apenas funções podem acessar)
ALTER TABLE public.login_rate_limit ENABLE ROW LEVEL SECURITY;

-- Apenas functions/triggers podem acessar esta tabela
CREATE POLICY "rate_limit_function_access" ON public.login_rate_limit
    FOR ALL USING (false); -- Bloqueia acesso direto

-- Criar função para verificar rate limiting
CREATE OR REPLACE FUNCTION public.check_login_rate_limit_enhanced(
    p_identifier text,
    p_type text DEFAULT 'email',
    p_max_attempts integer DEFAULT 5,
    p_window_minutes integer DEFAULT 15,
    p_block_minutes integer DEFAULT 30
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_record RECORD;
    time_window TIMESTAMP WITH TIME ZONE;
    result JSONB;
BEGIN
    time_window := NOW() - INTERVAL '1 minute' * p_window_minutes;
    
    -- Buscar registro existente
    SELECT * INTO current_record 
    FROM public.login_rate_limit 
    WHERE identifier = lower(p_identifier) AND identifier_type = p_type;
    
    -- Se não existe registro, criar
    IF NOT FOUND THEN
        INSERT INTO public.login_rate_limit (identifier, identifier_type, attempts)
        VALUES (lower(p_identifier), p_type, 1);
        
        RETURN jsonb_build_object(
            'allowed', true,
            'attempts_remaining', p_max_attempts - 1,
            'reset_at', NOW() + INTERVAL '1 minute' * p_window_minutes
        );
    END IF;
    
    -- Se está bloqueado e ainda não expirou
    IF current_record.blocked_until IS NOT NULL AND current_record.blocked_until > NOW() THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'blocked',
            'blocked_until', current_record.blocked_until,
            'attempts_remaining', 0
        );
    END IF;
    
    -- Se a janela de tempo passou, resetar contador
    IF current_record.first_attempt_at < time_window THEN
        UPDATE public.login_rate_limit 
        SET 
            attempts = 1,
            first_attempt_at = NOW(),
            last_attempt_at = NOW(),
            blocked_until = NULL,
            updated_at = NOW()
        WHERE identifier = lower(p_identifier) AND identifier_type = p_type;
        
        RETURN jsonb_build_object(
            'allowed', true,
            'attempts_remaining', p_max_attempts - 1,
            'reset_at', NOW() + INTERVAL '1 minute' * p_window_minutes
        );
    END IF;
    
    -- Se ainda está dentro da janela, verificar limite
    IF current_record.attempts >= p_max_attempts THEN
        -- Bloquear por tempo especificado
        UPDATE public.login_rate_limit 
        SET 
            blocked_until = NOW() + INTERVAL '1 minute' * p_block_minutes,
            updated_at = NOW()
        WHERE identifier = lower(p_identifier) AND identifier_type = p_type;
        
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'rate_limit_exceeded',
            'blocked_until', NOW() + INTERVAL '1 minute' * p_block_minutes,
            'attempts_remaining', 0
        );
    END IF;
    
    -- Incrementar contador
    UPDATE public.login_rate_limit 
    SET 
        attempts = attempts + 1,
        last_attempt_at = NOW(),
        updated_at = NOW()
    WHERE identifier = lower(p_identifier) AND identifier_type = p_type;
    
    RETURN jsonb_build_object(
        'allowed', true,
        'attempts_remaining', p_max_attempts - (current_record.attempts + 1),
        'reset_at', current_record.first_attempt_at + INTERVAL '1 minute' * p_window_minutes
    );
END;
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_login_rate_limit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_login_rate_limit_updated_at
    BEFORE UPDATE ON public.login_rate_limit
    FOR EACH ROW
    EXECUTE FUNCTION public.update_login_rate_limit_updated_at();

-- Função para limpar registros antigos de rate limiting (limpeza automática)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limit_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Remover registros mais antigos que 24 horas que não estão bloqueados
    DELETE FROM public.login_rate_limit 
    WHERE created_at < NOW() - INTERVAL '24 hours'
    AND (blocked_until IS NULL OR blocked_until < NOW());
    
    RAISE NOTICE 'Limpeza de registros de rate limit concluída';
END;
$$;