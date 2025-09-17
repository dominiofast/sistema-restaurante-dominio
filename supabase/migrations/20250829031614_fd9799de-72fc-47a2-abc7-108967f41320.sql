-- Remover função existente e recriar componentizada
DROP FUNCTION IF EXISTS process_cashback_cancellation(integer);

-- REFATORAÇÃO FINAL: Sistema de cancelamento de cashback componentizado

-- 1. Função auxiliar para criar transações de cashback
CREATE OR REPLACE FUNCTION create_cashback_transaction(
    p_company_id UUID,
    p_customer_phone VARCHAR,
    p_customer_name VARCHAR,
    p_tipo VARCHAR,
    p_valor NUMERIC,
    p_pedido_id INTEGER,
    p_descricao TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
    transaction_id UUID;
BEGIN
    INSERT INTO cashback_transactions (
        company_id,
        customer_phone,
        customer_name,
        tipo,
        valor,
        pedido_id,
        descricao
    ) VALUES (
        p_company_id,
        p_customer_phone,
        p_customer_name,
        p_tipo,
        p_valor,
        p_pedido_id,
        p_descricao
    ) RETURNING id INTO transaction_id;
    
    RETURN transaction_id;
END;
$$;

-- 2. Função para processar estorno de cashback usado
CREATE OR REPLACE FUNCTION process_cashback_refund(
    p_company_id UUID,
    p_customer_phone VARCHAR,
    p_customer_name VARCHAR,
    p_valor_estorno NUMERIC,
    p_pedido_id INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
    -- Validar entrada
    IF p_valor_estorno <= 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Atualizar saldo do cliente
    UPDATE customer_cashback 
    SET 
        saldo_disponivel = saldo_disponivel + p_valor_estorno,
        updated_at = now()
    WHERE company_id = p_company_id 
    AND customer_phone = p_customer_phone;
    
    -- Verificar se a atualização foi bem-sucedida
    IF FOUND THEN
        -- Registrar transação de estorno
        PERFORM create_cashback_transaction(
            p_company_id,
            p_customer_phone,
            p_customer_name,
            'credito',
            p_valor_estorno,
            p_pedido_id,
            'Estorno de cashback por cancelamento do pedido #' || p_pedido_id
        );
        
        RAISE NOTICE 'Cashback estornado: R$ % para pedido %', p_valor_estorno, p_pedido_id;
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- 3. Função para processar cancelamento de cashback gerado
CREATE OR REPLACE FUNCTION process_cashback_cancellation_generated(
    p_company_id UUID,
    p_customer_phone VARCHAR,
    p_customer_name VARCHAR,
    p_valor_cancelamento NUMERIC,
    p_pedido_id INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
    -- Validar entrada
    IF p_valor_cancelamento <= 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Atualizar saldo do cliente (remover cashback gerado)
    UPDATE customer_cashback 
    SET 
        saldo_disponivel = GREATEST(saldo_disponivel - p_valor_cancelamento, 0),
        saldo_total_acumulado = GREATEST(saldo_total_acumulado - p_valor_cancelamento, 0),
        updated_at = now()
    WHERE company_id = p_company_id 
    AND customer_phone = p_customer_phone;
    
    -- Verificar se a atualização foi bem-sucedida
    IF FOUND THEN
        -- Registrar transação de cancelamento
        PERFORM create_cashback_transaction(
            p_company_id,
            p_customer_phone,
            p_customer_name,
            'debito',
            p_valor_cancelamento,
            p_pedido_id,
            'Cancelamento de cashback por cancelamento do pedido #' || p_pedido_id
        );
        
        RAISE NOTICE 'Cashback cancelado: R$ % para pedido %', p_valor_cancelamento, p_pedido_id;
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- 4. Função para buscar valores de cashback de um pedido
CREATE OR REPLACE FUNCTION get_cashback_values_by_order(p_pedido_id INTEGER)
RETURNS TABLE(
    cashback_usado NUMERIC,
    cashback_gerado NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN tipo = 'debito' THEN valor ELSE 0 END), 0) as cashback_usado,
        COALESCE(SUM(CASE WHEN tipo = 'credito' THEN valor ELSE 0 END), 0) as cashback_gerado
    FROM cashback_transactions
    WHERE pedido_id = p_pedido_id;
END;
$$;

-- 5. Função principal refatorada e componentizada
CREATE OR REPLACE FUNCTION process_cashback_cancellation(pedido_id_param INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
    pedido_info RECORD;
    cashback_values RECORD;
    estorno_success BOOLEAN := FALSE;
    cancelamento_success BOOLEAN := FALSE;
    result JSONB;
BEGIN
    -- Buscar dados do pedido
    SELECT company_id, telefone, nome 
    INTO pedido_info
    FROM pedidos 
    WHERE id = pedido_id_param;
    
    -- Se não encontrou o pedido, retornar erro
    IF pedido_info IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Pedido não encontrado',
            'pedido_id', pedido_id_param
        );
    END IF;
    
    -- Buscar valores de cashback do pedido
    SELECT * INTO cashback_values
    FROM get_cashback_values_by_order(pedido_id_param);
    
    -- Processar estorno de cashback usado
    IF cashback_values.cashback_usado > 0 THEN
        estorno_success := process_cashback_refund(
            pedido_info.company_id,
            pedido_info.telefone,
            pedido_info.nome,
            cashback_values.cashback_usado,
            pedido_id_param
        );
    END IF;
    
    -- Processar cancelamento de cashback gerado
    IF cashback_values.cashback_gerado > 0 THEN
        cancelamento_success := process_cashback_cancellation_generated(
            pedido_info.company_id,
            pedido_info.telefone,
            pedido_info.nome,
            cashback_values.cashback_gerado,
            pedido_id_param
        );
    END IF;
    
    -- Criar log consolidado da operação
    INSERT INTO ai_conversation_logs (
        company_id,
        customer_phone,
        customer_name,
        message_content,
        message_type,
        created_at
    ) VALUES (
        pedido_info.company_id,
        pedido_info.telefone,
        pedido_info.nome,
        jsonb_build_object(
            'pedido_id', pedido_id_param,
            'cashback_usado_estornado', cashback_values.cashback_usado,
            'cashback_gerado_cancelado', cashback_values.cashback_gerado,
            'estorno_success', estorno_success,
            'cancelamento_success', cancelamento_success
        )::text,
        'cashback_cancellation',
        now()
    );
    
    -- Retornar resultado detalhado
    result := jsonb_build_object(
        'success', true,
        'pedido_id', pedido_id_param,
        'company_id', pedido_info.company_id,
        'customer_phone', pedido_info.telefone,
        'cashback_usado_estornado', cashback_values.cashback_usado,
        'cashback_gerado_cancelado', cashback_values.cashback_gerado,
        'estorno_realizado', estorno_success,
        'cancelamento_realizado', cancelamento_success
    );
    
    RETURN result;
END;
$$;