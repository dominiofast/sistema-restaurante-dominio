-- CRIAR FUNÇÃO PARA CREDITAR CASHBACK COM IDEMPOTÊNCIA
CREATE OR REPLACE FUNCTION public.safe_credit_cashback(
    p_company_id UUID,
    p_customer_phone VARCHAR,
    p_customer_name TEXT,
    p_amount NUMERIC,
    p_description TEXT,
    p_pedido_id INTEGER DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    transaction_id UUID;
    existing_transaction UUID;
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

    -- Verificar idempotência se chave foi fornecida
    IF p_idempotency_key IS NOT NULL THEN
        SELECT id INTO existing_transaction
        FROM cashback_transactions
        WHERE company_id = p_company_id
          AND customer_phone = p_customer_phone
          AND pedido_id = p_pedido_id
          AND tipo = 'credito'
          AND valor = p_amount
          AND descricao = p_description
          AND created_at >= now() - interval '1 hour'; -- Dentro da última hora

        IF existing_transaction IS NOT NULL THEN
            RETURN jsonb_build_object(
                'success', true,
                'transaction_id', existing_transaction,
                'message', 'Transação já processada (idempotente)'
            );
        END IF;
    END IF;

    -- Criar ou atualizar registro do cliente
    INSERT INTO customer_cashback (
        company_id,
        customer_phone,
        customer_name,
        saldo_disponivel,
        saldo_total_acumulado,
        created_at,
        updated_at
    ) VALUES (
        p_company_id,
        p_customer_phone,
        p_customer_name,
        p_amount,
        p_amount,
        now(),
        now()
    )
    ON CONFLICT (company_id, customer_phone)
    DO UPDATE SET
        saldo_disponivel = customer_cashback.saldo_disponivel + p_amount,
        saldo_total_acumulado = customer_cashback.saldo_total_acumulado + p_amount,
        updated_at = now();

    -- Criar transação de crédito
    INSERT INTO cashback_transactions (
        company_id,
        customer_phone,
        customer_name,
        tipo,
        valor,
        descricao,
        pedido_id,
        created_at
    ) VALUES (
        p_company_id,
        p_customer_phone,
        p_customer_name,
        'credito',
        p_amount,
        p_description,
        p_pedido_id,
        now()
    ) RETURNING id INTO transaction_id;

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', transaction_id,
        'credited_amount', p_amount
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Erro interno: ' || SQLERRM,
            'code', 'INTERNAL_ERROR'
        );
END;
$$;