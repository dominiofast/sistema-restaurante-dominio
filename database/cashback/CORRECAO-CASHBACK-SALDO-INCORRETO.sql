-- CORREÇÃO: Saldos de Cashback Incorretos
-- Este script corrige os saldos de cashback que foram sobrescritos incorretamente
-- devido ao problema na função generateOrderCashback

-- 1. Primeiro, vamos verificar quais clientes foram afetados
SELECT 
    cc.company_id,
    cc.customer_phone,
    cc.customer_name,
    cc.saldo_disponivel as saldo_atual,
    cc.saldo_total_acumulado as total_acumulado_atual,
    COUNT(ct.id) as total_transacoes,
    COALESCE(SUM(CASE WHEN ct.tipo = 'credito' THEN ct.valor ELSE 0 END), 0) as total_creditos,
    COALESCE(SUM(CASE WHEN ct.tipo = 'debito' THEN ct.valor ELSE 0 END), 0) as total_debitos,
    COALESCE(SUM(CASE WHEN ct.tipo = 'credito' THEN ct.valor ELSE -ct.valor END), 0) as saldo_correto_calculado
FROM customer_cashback cc
LEFT JOIN cashback_transactions ct ON 
    cc.company_id = ct.company_id AND 
    cc.customer_phone = ct.customer_phone
GROUP BY cc.company_id, cc.customer_phone, cc.customer_name, cc.saldo_disponivel, cc.saldo_total_acumulado
HAVING cc.saldo_disponivel != COALESCE(SUM(CASE WHEN ct.tipo = 'credito' THEN ct.valor ELSE -ct.valor END), 0)
ORDER BY cc.company_id, cc.customer_phone;

-- 2. Corrigir os saldos baseado nas transações reais
WITH saldos_corrigidos AS (
    SELECT 
        cc.company_id,
        cc.customer_phone,
        cc.customer_name,
        COALESCE(SUM(CASE WHEN ct.tipo = 'credito' THEN ct.valor ELSE 0 END), 0) as total_creditos,
        COALESCE(SUM(CASE WHEN ct.tipo = 'debito' THEN ct.valor ELSE 0 END), 0) as total_debitos,
        COALESCE(SUM(CASE WHEN ct.tipo = 'credito' THEN ct.valor ELSE -ct.valor END), 0) as saldo_correto,
        cc.saldo_disponivel as saldo_atual,
        cc.saldo_total_acumulado as total_acumulado_atual
    FROM customer_cashback cc
    LEFT JOIN cashback_transactions ct ON 
        cc.company_id = ct.company_id AND 
        cc.customer_phone = ct.customer_phone
    GROUP BY cc.company_id, cc.customer_phone, cc.customer_name, cc.saldo_disponivel, cc.saldo_total_acumulado
)
UPDATE customer_cashback 
SET 
    saldo_disponivel = GREATEST(saldos_corrigidos.saldo_correto, 0),
    saldo_total_acumulado = saldos_corrigidos.total_creditos,
    updated_at = now()
FROM saldos_corrigidos
WHERE customer_cashback.company_id = saldos_corrigidos.company_id 
  AND customer_cashback.customer_phone = saldos_corrigidos.customer_phone
  AND customer_cashback.saldo_disponivel != GREATEST(saldos_corrigidos.saldo_correto, 0);

-- 3. Verificar se a correção foi aplicada corretamente
SELECT 
    cc.company_id,
    cc.customer_phone,
    cc.customer_name,
    cc.saldo_disponivel as saldo_corrigido,
    cc.saldo_total_acumulado as total_acumulado_corrigido,
    COUNT(ct.id) as total_transacoes,
    COALESCE(SUM(CASE WHEN ct.tipo = 'credito' THEN ct.valor ELSE 0 END), 0) as total_creditos,
    COALESCE(SUM(CASE WHEN ct.tipo = 'debito' THEN ct.valor ELSE 0 END), 0) as total_debitos,
    COALESCE(SUM(CASE WHEN ct.tipo = 'credito' THEN ct.valor ELSE -ct.valor END), 0) as saldo_calculado
FROM customer_cashback cc
LEFT JOIN cashback_transactions ct ON 
    cc.company_id = ct.company_id AND 
    cc.customer_phone = ct.customer_phone
GROUP BY cc.company_id, cc.customer_phone, cc.customer_name, cc.saldo_disponivel, cc.saldo_total_acumulado
ORDER BY cc.company_id, cc.customer_phone;

-- 4. Criar função para prevenir este problema no futuro
CREATE OR REPLACE FUNCTION safe_generate_cashback(
    p_company_id UUID,
    p_customer_phone VARCHAR,
    p_customer_name TEXT,
    p_cashback_value NUMERIC,
    p_pedido_id INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_balance RECORD;
    new_balance NUMERIC;
    transaction_id UUID;
BEGIN
    -- Buscar saldo atual
    SELECT saldo_disponivel, saldo_total_acumulado INTO current_balance
    FROM customer_cashback 
    WHERE company_id = p_company_id 
      AND customer_phone = p_customer_phone;
    
    IF FOUND THEN
        -- Cliente existe - ADICIONAR ao saldo existente
        new_balance := current_balance.saldo_disponivel + p_cashback_value;
        
        UPDATE customer_cashback 
        SET 
            saldo_disponivel = new_balance,
            saldo_total_acumulado = saldo_total_acumulado + p_cashback_value,
            customer_name = COALESCE(p_customer_name, customer_name),
            updated_at = now()
        WHERE company_id = p_company_id 
          AND customer_phone = p_customer_phone;
    ELSE
        -- Cliente não existe - CRIAR novo registro
        INSERT INTO customer_cashback (
            company_id, 
            customer_phone, 
            customer_name,
            saldo_disponivel, 
            saldo_total_acumulado
        ) VALUES (
            p_company_id, 
            p_customer_phone, 
            p_customer_name,
            p_cashback_value, 
            p_cashback_value
        );
        
        new_balance := p_cashback_value;
    END IF;
    
    -- Registrar transação
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
        'credito',
        p_cashback_value,
        p_pedido_id,
        'Cashback do pedido #' || p_pedido_id
    ) RETURNING id INTO transaction_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', transaction_id,
        'new_balance', new_balance,
        'cashback_value', p_cashback_value,
        'message', 'Cashback gerado com sucesso'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Erro ao gerar cashback'
    );
END;
$$;

-- 5. Comentário explicativo
/*
PROBLEMA IDENTIFICADO E CORRIGIDO:

O problema estava na função generateOrderCashback que usava upsert com:
- saldo_disponivel: cashbackValue
- saldo_total_acumulado: cashbackValue

Isso SUBSTITUÍA o saldo existente ao invés de ADICIONAR a ele.

SOLUÇÃO IMPLEMENTADA:

1. Corrigido o código TypeScript para verificar saldo existente e adicionar
2. Criado script SQL para corrigir saldos incorretos
3. Criada função safe_generate_cashback para prevenir futuros problemas

FLUXO CORRETO:
1. Cliente faz pedido
2. Cashback é debitado (se aplicado)
3. Novo cashback é ADICIONADO ao saldo existente (não substituído)
4. Saldo final = saldo anterior - débito + novo crédito
*/
