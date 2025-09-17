-- Corrigir função para atualizar saldo de cashback do cliente
CREATE OR REPLACE FUNCTION update_customer_cashback_balance(
    p_company_id UUID,
    p_customer_phone VARCHAR,
    p_amount NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
    -- Atualizar saldo disponível e total acumulado
    UPDATE customer_cashback 
    SET 
        saldo_disponivel = saldo_disponivel + p_amount,
        saldo_total_acumulado = saldo_total_acumulado + p_amount,
        updated_at = now()
    WHERE company_id = p_company_id 
    AND customer_phone = p_customer_phone;
    
    -- Se não existe registro, criar um novo
    IF NOT FOUND THEN
        INSERT INTO customer_cashback (
            company_id, 
            customer_phone, 
            customer_name,
            saldo_disponivel, 
            saldo_total_acumulado
        ) VALUES (
            p_company_id, 
            p_customer_phone, 
            'Cliente',
            p_amount, 
            p_amount
        );
    END IF;
END;
$$;