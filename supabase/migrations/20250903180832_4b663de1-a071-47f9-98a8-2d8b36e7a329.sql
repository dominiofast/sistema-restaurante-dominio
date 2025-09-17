-- HABILITAR REAL-TIME PARA CASHBACK
-- Necessário para sincronização automática do frontend

-- 1. Habilitar replica identity para capturar mudanças completas
ALTER TABLE public.customer_cashback REPLICA IDENTITY FULL;
ALTER TABLE public.cashback_transactions REPLICA IDENTITY FULL;

-- 2. Adicionar tabelas à publicação realtime
ALTER publication supabase_realtime ADD TABLE public.customer_cashback;
ALTER publication supabase_realtime ADD TABLE public.cashback_transactions;

-- 3. Corrigir a verificação de saldo suficiente usando função segura
CREATE OR REPLACE FUNCTION public.check_sufficient_cashback_balance(
    p_company_id uuid, 
    p_customer_phone character varying, 
    p_required_amount numeric
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_balance NUMERIC := 0;
BEGIN
    -- Buscar saldo atual baseado nas transações (sempre correto)
    SELECT COALESCE(SUM(
        CASE 
            WHEN tipo = 'credito' THEN valor 
            WHEN tipo = 'debito' THEN -valor 
            ELSE 0 
        END
    ), 0)
    INTO v_current_balance
    FROM cashback_transactions 
    WHERE company_id = p_company_id 
    AND customer_phone = p_customer_phone;
    
    RETURN v_current_balance >= p_required_amount;
END;
$$;

-- 4. Função para obter saldo atual em tempo real
CREATE OR REPLACE FUNCTION public.get_realtime_cashback_balance(
    p_company_id uuid, 
    p_customer_phone character varying
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_saldo_disponivel NUMERIC := 0;
    v_saldo_total_acumulado NUMERIC := 0;
    v_customer_name TEXT;
BEGIN
    -- Calcular saldo baseado nas transações (sempre correto)
    SELECT 
        COALESCE(SUM(CASE WHEN tipo = 'credito' THEN valor ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN tipo = 'debito' THEN valor ELSE 0 END), 0)
    INTO v_saldo_total_acumulado, v_saldo_disponivel
    FROM cashback_transactions 
    WHERE company_id = p_company_id AND customer_phone = p_customer_phone;
    
    v_saldo_disponivel := v_saldo_total_acumulado - v_saldo_disponivel;
    
    -- Buscar nome do cliente
    SELECT customer_name 
    INTO v_customer_name
    FROM customer_cashback 
    WHERE company_id = p_company_id AND customer_phone = p_customer_phone
    LIMIT 1;
    
    RETURN jsonb_build_object(
        'availableBalance', v_saldo_disponivel,
        'totalAccumulated', v_saldo_total_acumulado,
        'customerName', COALESCE(v_customer_name, 'Cliente')
    );
END;
$$;

-- 5. Log de implementação
INSERT INTO ai_conversation_logs (
    company_id, customer_phone, customer_name, message_content, message_type, created_at
) VALUES (
    '11e10dba-8ed0-47fc-91f5-bc88f2aef4ca', 'SYSTEM', 'CASHBACK_REALTIME',
    '🚀 REAL-TIME HABILITADO: Sistema de cashback agora sincroniza automaticamente. Funções de verificação seguras implementadas.',
    'realtime_cashback_enabled', now()
);