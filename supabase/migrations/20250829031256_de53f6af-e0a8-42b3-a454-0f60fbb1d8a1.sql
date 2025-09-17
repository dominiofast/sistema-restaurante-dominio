-- Função para processar cancelamento de cashback quando pedido é cancelado
CREATE OR REPLACE FUNCTION process_cashback_cancellation(pedido_id_param INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
    company_id_var UUID;
    customer_phone_var VARCHAR;
    customer_name_var VARCHAR;
    cashback_usado NUMERIC := 0;
    cashback_gerado NUMERIC := 0;
BEGIN
    -- Buscar dados do pedido
    SELECT company_id, telefone, nome 
    INTO company_id_var, customer_phone_var, customer_name_var
    FROM pedidos 
    WHERE id = pedido_id_param;
    
    -- Se não encontrou o pedido, sair
    IF company_id_var IS NULL THEN
        RETURN;
    END IF;
    
    -- Buscar cashback usado (débito) neste pedido
    SELECT COALESCE(SUM(valor), 0)
    INTO cashback_usado
    FROM cashback_transactions
    WHERE pedido_id = pedido_id_param 
    AND tipo = 'debito';
    
    -- Buscar cashback gerado (crédito) neste pedido
    SELECT COALESCE(SUM(valor), 0)
    INTO cashback_gerado
    FROM cashback_transactions
    WHERE pedido_id = pedido_id_param 
    AND tipo = 'credito';
    
    -- Se houve cashback usado, devolver ao saldo
    IF cashback_usado > 0 THEN
        -- Atualizar saldo do cliente
        UPDATE customer_cashback 
        SET 
            saldo_disponivel = saldo_disponivel + cashback_usado,
            updated_at = now()
        WHERE company_id = company_id_var 
        AND customer_phone = customer_phone_var;
        
        -- Registrar transação de estorno
        INSERT INTO cashback_transactions (
            company_id,
            customer_phone,
            customer_name,
            tipo,
            valor,
            pedido_id,
            descricao
        ) VALUES (
            company_id_var,
            customer_phone_var,
            customer_name_var,
            'credito',
            cashback_usado,
            pedido_id_param,
            'Estorno de cashback por cancelamento do pedido #' || pedido_id_param
        );
        
        RAISE NOTICE 'Estornado cashback usado: R$ % para pedido %', cashback_usado, pedido_id_param;
    END IF;
    
    -- Se houve cashback gerado, remover do saldo
    IF cashback_gerado > 0 THEN
        -- Atualizar saldo do cliente (remover cashback gerado)
        UPDATE customer_cashback 
        SET 
            saldo_disponivel = GREATEST(saldo_disponivel - cashback_gerado, 0),
            saldo_total_acumulado = GREATEST(saldo_total_acumulado - cashback_gerado, 0),
            updated_at = now()
        WHERE company_id = company_id_var 
        AND customer_phone = customer_phone_var;
        
        -- Registrar transação de cancelamento
        INSERT INTO cashback_transactions (
            company_id,
            customer_phone,
            customer_name,
            tipo,
            valor,
            pedido_id,
            descricao
        ) VALUES (
            company_id_var,
            customer_phone_var,
            customer_name_var,
            'debito',
            cashback_gerado,
            pedido_id_param,
            'Cancelamento de cashback por cancelamento do pedido #' || pedido_id_param
        );
        
        RAISE NOTICE 'Cancelado cashback gerado: R$ % para pedido %', cashback_gerado, pedido_id_param;
    END IF;
    
    -- Log da operação
    INSERT INTO ai_conversation_logs (
        company_id,
        customer_phone,
        customer_name,
        message_content,
        message_type,
        created_at
    ) VALUES (
        company_id_var,
        customer_phone_var,
        customer_name_var,
        'CANCELAMENTO CASHBACK: Pedido #' || pedido_id_param || ' - Estornado: R$ ' || cashback_usado || ' - Cancelado: R$ ' || cashback_gerado,
        'cashback_cancellation',
        now()
    );
END;
$$;

-- Trigger para processar cancelamento automaticamente
CREATE OR REPLACE FUNCTION trigger_cashback_cancellation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
    -- Se o status mudou para cancelado
    IF OLD.status != 'cancelado' AND NEW.status = 'cancelado' THEN
        -- Processar cancelamento do cashback
        PERFORM process_cashback_cancellation(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Criar trigger nos pedidos
DROP TRIGGER IF EXISTS pedido_cashback_cancellation_trigger ON pedidos;
CREATE TRIGGER pedido_cashback_cancellation_trigger
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_cashback_cancellation();