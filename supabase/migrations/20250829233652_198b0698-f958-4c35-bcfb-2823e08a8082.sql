-- SEGUNDA FASE: APLICAR CONSTRAINTS E FUNÇÕES DE SEGURANÇA
-- Agora que removemos os dados inválidos, podemos aplicar os constraints

-- 1. ADICIONAR CONSTRAINT PARA IMPEDIR SALDO NEGATIVO
ALTER TABLE customer_cashback 
ADD CONSTRAINT check_saldo_positivo 
CHECK (saldo_disponivel >= 0);

-- 2. ADICIONAR CONSTRAINT PARA IMPEDIR VALORES NEGATIVOS EM TRANSAÇÕES
ALTER TABLE cashback_transactions 
ADD CONSTRAINT check_valor_positivo 
CHECK (valor > 0);

-- 3. CRIAR FUNÇÃO SEGURA PARA DEBITAR CASHBACK COM VALIDAÇÃO
CREATE OR REPLACE FUNCTION public.safe_debit_cashback(
    p_company_id UUID,
    p_customer_phone VARCHAR,
    p_amount NUMERIC,
    p_description TEXT,
    p_pedido_id INTEGER DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    current_balance NUMERIC;
    transaction_id UUID;
    result JSONB;
BEGIN
    -- Verificar se o valor é positivo
    IF p_amount <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Valor deve ser positivo',
            'code', 'INVALID_AMOUNT'
        );
    END IF;

    -- Buscar saldo atual com lock para evitar condições de corrida
    SELECT saldo_disponivel INTO current_balance
    FROM customer_cashback 
    WHERE company_id = p_company_id 
      AND customer_phone = p_customer_phone
    FOR UPDATE;

    -- Verificar se cliente existe
    IF current_balance IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cliente não possui cashback',
            'code', 'NO_CASHBACK_ACCOUNT'
        );
    END IF;

    -- Verificar se tem saldo suficiente
    IF current_balance < p_amount THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Saldo insuficiente',
            'code', 'INSUFFICIENT_BALANCE',
            'available_balance', current_balance,
            'requested_amount', p_amount
        );
    END IF;

    -- Criar transação de débito
    INSERT INTO cashback_transactions (
        company_id,
        customer_phone,
        customer_name,
        tipo,
        valor,
        descricao,
        pedido_id,
        created_at
    ) 
    SELECT 
        p_company_id,
        p_customer_phone,
        customer_name,
        'debito',
        p_amount,
        p_description,
        p_pedido_id,
        now()
    FROM customer_cashback 
    WHERE company_id = p_company_id 
      AND customer_phone = p_customer_phone
    RETURNING id INTO transaction_id;

    -- Atualizar saldo
    UPDATE customer_cashback 
    SET 
        saldo_disponivel = saldo_disponivel - p_amount,
        updated_at = now()
    WHERE company_id = p_company_id 
      AND customer_phone = p_customer_phone;

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', transaction_id,
        'previous_balance', current_balance,
        'new_balance', current_balance - p_amount,
        'debited_amount', p_amount
    );

EXCEPTION
    WHEN check_violation THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Operação violaria constraints de segurança',
            'code', 'CONSTRAINT_VIOLATION'
        );
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Erro interno: ' || SQLERRM,
            'code', 'INTERNAL_ERROR'
        );
END;
$$;