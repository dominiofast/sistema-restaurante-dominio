-- CORREÇÃO URGENTE: Recalcular saldos de cashback baseado nas transações reais
-- Esta correção vai sincronizar os saldos da tabela customer_cashback com as transações

-- Função para recalcular saldo de cashback baseado nas transações
CREATE OR REPLACE FUNCTION recalculate_cashback_balance(p_company_id UUID, p_customer_phone VARCHAR)
RETURNS JSONB AS $$
DECLARE
    v_total_credito NUMERIC := 0;
    v_total_debito NUMERIC := 0;  
    v_saldo_final NUMERIC := 0;
    v_saldo_anterior NUMERIC := 0;
    v_customer_name TEXT;
BEGIN
    -- Buscar saldo anterior
    SELECT saldo_disponivel, customer_name 
    INTO v_saldo_anterior, v_customer_name
    FROM customer_cashback 
    WHERE company_id = p_company_id AND customer_phone = p_customer_phone;
    
    -- Calcular totais baseados nas transações
    SELECT 
        COALESCE(SUM(CASE WHEN tipo = 'credito' THEN valor ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN tipo = 'debito' THEN valor ELSE 0 END), 0)
    INTO v_total_credito, v_total_debito
    FROM cashback_transactions 
    WHERE company_id = p_company_id AND customer_phone = p_customer_phone;
    
    -- Calcular saldo final correto
    v_saldo_final := v_total_credito - v_total_debito;
    
    -- Atualizar o saldo na tabela customer_cashback
    UPDATE customer_cashback 
    SET 
        saldo_disponivel = v_saldo_final,
        saldo_total_acumulado = v_total_credito,
        updated_at = now()
    WHERE company_id = p_company_id AND customer_phone = p_customer_phone;
    
    -- Registrar log da correção
    INSERT INTO ai_conversation_logs (
        company_id, customer_phone, customer_name, message_content, message_type, created_at
    ) VALUES (
        p_company_id, p_customer_phone, COALESCE(v_customer_name, 'Cliente'),
        'CORREÇÃO CASHBACK: Saldo corrigido de R$ ' || v_saldo_anterior || ' para R$ ' || v_saldo_final || 
        ' | Créditos: R$ ' || v_total_credito || ' | Débitos: R$ ' || v_total_debito,
        'cashback_balance_fix', now()
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'saldo_anterior', v_saldo_anterior,
        'saldo_corrigido', v_saldo_final,
        'total_creditos', v_total_credito,
        'total_debitos', v_total_debito
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Aplicar correção para o cliente específico
SELECT recalculate_cashback_balance('11e10dba-8ed0-47fc-91f5-bc88f2aef4ca', '69992254080') as resultado;