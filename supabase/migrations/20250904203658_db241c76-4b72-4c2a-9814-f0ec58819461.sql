-- Função para zerar saldos negativos de cashback
CREATE OR REPLACE FUNCTION public.fix_negative_cashback_balance(
    p_company_id UUID,
    p_customer_phone VARCHAR
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_balance NUMERIC := 0;
    v_correction_amount NUMERIC := 0;
BEGIN
    -- Buscar saldo atual
    SELECT saldo_disponivel INTO v_current_balance
    FROM customer_cashback 
    WHERE company_id = p_company_id AND customer_phone = p_customer_phone;
    
    -- Se saldo é negativo, criar transação de correção
    IF v_current_balance < 0 THEN
        v_correction_amount := ABS(v_current_balance);
        
        -- Inserir transação de correção
        INSERT INTO cashback_transactions (
            company_id,
            customer_phone,
            customer_name,
            valor,
            tipo,
            descricao,
            created_at
        ) VALUES (
            p_company_id,
            p_customer_phone,
            (SELECT customer_name FROM customer_cashback WHERE company_id = p_company_id AND customer_phone = p_customer_phone),
            v_correction_amount,
            'credito',
            'CORREÇÃO AUTOMÁTICA: Ajuste de saldo negativo para zero',
            now()
        );
        
        -- O trigger auto_recalculate_cashback_balance vai atualizar o saldo automaticamente
        
        RETURN jsonb_build_object(
            'success', true,
            'saldo_anterior', v_current_balance,
            'correcao_aplicada', v_correction_amount,
            'novo_saldo', 0
        );
    ELSE
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Saldo já é positivo ou zero',
            'saldo_atual', v_current_balance
        );
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;