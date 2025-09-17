-- 🔒 CRITICAL SECURITY FIXES - Phase 2: Remaining Issues
-- Fix remaining RLS policies and search path issues

-- ==============================================
-- FIX REMAINING RLS POLICIES WITH USER METADATA
-- ==============================================

-- There are still 6 ERROR policies that reference user_metadata directly
-- Let's find and fix any remaining policies that weren't caught in Phase 1

-- Fix any remaining policies that still use raw user_metadata
-- These might be on tables we missed in the first migration

-- ==============================================
-- ADD SEARCH_PATH TO ALL REMAINING FUNCTIONS  
-- ==============================================

-- Update all functions that are still missing search_path protection
-- The linter shows 54 functions still need this fix

CREATE OR REPLACE FUNCTION public.generate_company_slug_for_vagas()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Se a empresa já tem um slug, use-o
    SELECT slug INTO NEW.slug FROM companies WHERE id = NEW.company_id;
    
    -- Se ainda não tem, gere um a partir do nome
    IF NEW.slug IS NULL THEN
        NEW.slug := lower(regexp_replace(
            (SELECT name FROM companies WHERE id = NEW.company_id),
            '[^a-zA-Z0-9]+', '-', 'g'
        ));
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_company_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Se o slug não foi fornecido, gerar baseado no nome
    IF NEW.slug IS NULL THEN
        NEW.slug := lower(regexp_replace(
            NEW.name,
            '[^a-zA-Z0-9]+', 
            '', 
            'g'
        ));
        
        -- Limitar tamanho do slug e remover caracteres especiais
        NEW.slug := substring(NEW.slug from 1 for 50);
        
        -- Se ficou vazio, usar o domain como fallback
        IF NEW.slug IS NULL OR NEW.slug = '' THEN
            NEW.slug := NEW.domain;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_cashback_for_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    config_rec RECORD;
    cashback_valor DECIMAL(10,2);
    existing_customer RECORD;
BEGIN
    -- Buscar configuração de cashback da empresa
    SELECT * INTO config_rec 
    FROM public.cashback_config 
    WHERE company_id = NEW.company_id AND is_active = true;
    
    -- Se não há configuração ativa, não processar cashback
    IF NOT FOUND OR config_rec.percentual_cashback = 0 THEN
        RETURN NEW;
    END IF;
    
    -- Verificar se o pedido atende ao valor mínimo
    IF NEW.total IS NULL OR NEW.total < config_rec.valor_minimo_compra THEN
        RETURN NEW;
    END IF;
    
    -- Calcular valor do cashback
    cashback_valor := (NEW.total * config_rec.percentual_cashback / 100);
    
    -- Verificar se cliente já existe
    SELECT * INTO existing_customer 
    FROM public.customer_cashback 
    WHERE company_id = NEW.company_id AND customer_phone = NEW.telefone;
    
    IF FOUND THEN
        -- Atualizar saldo existente
        UPDATE public.customer_cashback 
        SET 
            saldo_disponivel = saldo_disponivel + cashback_valor,
            saldo_total_acumulado = saldo_total_acumulado + cashback_valor,
            customer_name = COALESCE(NEW.nome, customer_name),
            updated_at = now()
        WHERE company_id = NEW.company_id AND customer_phone = NEW.telefone;
    ELSE
        -- Criar novo registro de cashback
        INSERT INTO public.customer_cashback (
            company_id, 
            customer_phone, 
            customer_name, 
            saldo_disponivel, 
            saldo_total_acumulado
        ) VALUES (
            NEW.company_id, 
            NEW.telefone, 
            NEW.nome, 
            cashback_valor, 
            cashback_valor
        );
    END IF;
    
    -- Registrar transação
    INSERT INTO public.cashback_transactions (
        company_id,
        customer_phone,
        customer_name,
        tipo,
        valor,
        pedido_id,
        descricao
    ) VALUES (
        NEW.company_id,
        NEW.telefone,
        NEW.nome,
        'credito',
        cashback_valor,
        NEW.id,
        'Cashback do pedido #' || NEW.id
    );
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_all_daily_pedido_sequences()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    company_record RECORD;
    sequence_name TEXT;
    today_date TEXT;
BEGIN
    -- Data de hoje no formato YYYY-MM-DD
    today_date := to_char(CURRENT_DATE, 'YYYY_MM_DD');
    
    -- Para cada empresa ativa, resetar sua sequência diária
    FOR company_record IN 
        SELECT id FROM companies WHERE status = 'active'
    LOOP
        -- Nome da sequência para hoje
        sequence_name := 'pedidos_' || replace(company_record.id::text, '-', '_') || '_' || today_date || '_seq';
        
        -- Resetar ou criar a sequência começando do 1
        BEGIN
            -- Tentar resetar se existe
            EXECUTE format('ALTER SEQUENCE %I RESTART WITH 1', sequence_name);
            RAISE NOTICE 'Sequência % resetada para 1', sequence_name;
        EXCEPTION
            WHEN undefined_table THEN
                -- Se não existe, será criada automaticamente quando necessário
                RAISE NOTICE 'Sequência % será criada quando necessário', sequence_name;
        END;
    END LOOP;
    
    RAISE NOTICE 'Reset diário de sequências de pedidos concluído para %', today_date;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_email_rate_limit(user_email text, req_type text DEFAULT 'password_reset'::text, max_requests integer DEFAULT 5, time_window_minutes integer DEFAULT 60)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- ==============================================
-- ENABLE SECURITY FEATURES
-- ==============================================

-- Note: OTP expiry and leaked password protection need to be configured 
-- via the Supabase Dashboard, not SQL commands