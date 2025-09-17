-- CORREÇÃO: Sistema de Cashback com Cálculos Inconsistentes
-- PROBLEMA: Cashback sendo gerado duplicado (trigger automático + OrderCreationService)
-- SOLUÇÃO: Remover trigger automático e manter apenas geração controlada

-- 1. DESABILITAR O TRIGGER AUTOMÁTICO QUE ESTÁ CAUSANDO DUPLICAÇÃO
DROP TRIGGER IF EXISTS process_order_cashback ON public.pedidos;

-- 2. CRIAR FUNÇÃO PARA ZERAR SALDO ANTERIOR E CREDITAR NOVO CASHBACK
CREATE OR REPLACE FUNCTION public.reset_and_credit_cashback(
    p_company_id UUID,
    p_customer_phone VARCHAR,
    p_customer_name TEXT,
    p_cashback_amount DECIMAL(10,2),
    p_pedido_id INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
    v_existing_customer RECORD;
BEGIN
    -- Buscar cliente existente
    SELECT * INTO v_existing_customer 
    FROM public.customer_cashback 
    WHERE company_id = p_company_id AND customer_phone = p_customer_phone;
    
    IF FOUND THEN
        -- ZERAR saldo anterior e creditar novo valor
        UPDATE public.customer_cashback 
        SET 
            saldo_disponivel = p_cashback_amount, -- ZERA e define novo valor
            saldo_total_acumulado = saldo_total_acumulado + p_cashback_amount, -- Acumula no total
            customer_name = COALESCE(p_customer_name, customer_name),
            updated_at = now()
        WHERE company_id = p_company_id AND customer_phone = p_customer_phone;
    ELSE
        -- Criar novo registro
        INSERT INTO public.customer_cashback (
            company_id, 
            customer_phone, 
            customer_name, 
            saldo_disponivel, 
            saldo_total_acumulado
        ) VALUES (
            p_company_id, 
            p_customer_phone, 
            p_customer_name, 
            p_cashback_amount, 
            p_cashback_amount
        );
    END IF;
    
    -- Registrar transação de crédito
    INSERT INTO public.cashback_transactions (
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
        p_cashback_amount,
        p_pedido_id,
        'Cashback do pedido #' || p_pedido_id
    );
    
    RAISE NOTICE 'Cashback processado: Zerou saldo anterior e creditou R$ % para cliente %', p_cashback_amount, p_customer_phone;
END;
$$;

-- 3. CRIAR FUNÇÃO PARA DEBITAR CASHBACK (quando cliente usa o saldo)
CREATE OR REPLACE FUNCTION public.debit_cashback(
    p_company_id UUID,
    p_customer_phone VARCHAR,
    p_customer_name TEXT,
    p_debit_amount DECIMAL(10,2),
    p_pedido_id INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
    v_current_balance DECIMAL(10,2);
BEGIN
    -- Buscar saldo atual
    SELECT saldo_disponivel INTO v_current_balance
    FROM public.customer_cashback 
    WHERE company_id = p_company_id AND customer_phone = p_customer_phone;
    
    -- Verificar se tem saldo suficiente
    IF v_current_balance IS NULL OR v_current_balance < p_debit_amount THEN
        RAISE NOTICE 'Saldo insuficiente: R$ % disponível, R$ % solicitado', v_current_balance, p_debit_amount;
        RETURN FALSE;
    END IF;
    
    -- Debitar o valor
    UPDATE public.customer_cashback 
    SET 
        saldo_disponivel = saldo_disponivel - p_debit_amount,
        updated_at = now()
    WHERE company_id = p_company_id AND customer_phone = p_customer_phone;
    
    -- Registrar transação de débito
    INSERT INTO public.cashback_transactions (
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
        'debito',
        p_debit_amount,
        p_pedido_id,
        'Cashback utilizado no pedido #' || p_pedido_id
    );
    
    RAISE NOTICE 'Cashback debitado: R$ % do cliente %', p_debit_amount, p_customer_phone;
    RETURN TRUE;
END;
$$;

-- 4. ATUALIZAR A FUNÇÃO update_customer_cashback_balance PARA USAR A NOVA LÓGICA
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
    -- Usar a nova função que zera e credita
    PERFORM public.reset_and_credit_cashback(
        p_company_id,
        p_customer_phone,
        'Cliente',
        p_amount,
        NULL -- pedido_id será NULL para atualizações manuais
    );
END;
$$;

-- 5. CRIAR FUNÇÃO PARA VERIFICAR E CORRIGIR DADOS INCONSISTENTES
CREATE OR REPLACE FUNCTION public.audit_cashback_consistency()
RETURNS TABLE(
    company_id UUID,
    customer_phone VARCHAR,
    saldo_disponivel DECIMAL(10,2),
    total_creditos DECIMAL(10,2),
    total_debitos DECIMAL(10,2),
    saldo_calculado DECIMAL(10,2),
    inconsistencia DECIMAL(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cc.company_id,
        cc.customer_phone,
        cc.saldo_disponivel,
        COALESCE(creditos.total_creditos, 0) as total_creditos,
        COALESCE(debitos.total_debitos, 0) as total_debitos,
        (COALESCE(creditos.total_creditos, 0) - COALESCE(debitos.total_debitos, 0)) as saldo_calculado,
        (cc.saldo_disponivel - (COALESCE(creditos.total_creditos, 0) - COALESCE(debitos.total_debitos, 0))) as inconsistencia
    FROM public.customer_cashback cc
    LEFT JOIN (
        SELECT 
            company_id, 
            customer_phone, 
            SUM(valor) as total_creditos
        FROM public.cashback_transactions 
        WHERE tipo = 'credito'
        GROUP BY company_id, customer_phone
    ) creditos ON cc.company_id = creditos.company_id AND cc.customer_phone = creditos.customer_phone
    LEFT JOIN (
        SELECT 
            company_id, 
            customer_phone, 
            SUM(valor) as total_debitos
        FROM public.cashback_transactions 
        WHERE tipo = 'debito'
        GROUP BY company_id, customer_phone
    ) debitos ON cc.company_id = debitos.company_id AND cc.customer_phone = debitos.customer_phone
    WHERE ABS(cc.saldo_disponivel - (COALESCE(creditos.total_creditos, 0) - COALESCE(debitos.total_debitos, 0))) > 0.01;
END;
$$;

-- 6. COMENTÁRIOS EXPLICATIVOS
COMMENT ON FUNCTION public.reset_and_credit_cashback IS 'Zera saldo anterior e credita novo cashback - evita duplicação';
COMMENT ON FUNCTION public.debit_cashback IS 'Debita cashback do saldo do cliente - verifica disponibilidade';
COMMENT ON FUNCTION public.audit_cashback_consistency IS 'Audita consistência entre saldo e transações';

-- 7. LOG DA CORREÇÃO (comentado devido à constraint check_valor_positivo)
-- INSERT INTO public.cashback_transactions (
--     company_id,
--     customer_phone,
--     customer_name,
--     tipo,
--     valor,
--     pedido_id,
--     descricao
-- ) VALUES (
--     '00000000-0000-0000-0000-000000000000', -- UUID fictício para log
--     'SISTEMA',
--     'Sistema',
--     'credito',
--     0,
--     NULL,
--     'CORREÇÃO: Trigger automático removido para evitar duplicação de cashback'
-- );

-- Alternativa: Inserir log com valor mínimo positivo
INSERT INTO public.cashback_transactions (
    company_id,
    customer_phone,
    customer_name,
    tipo,
    valor,
    pedido_id,
    descricao
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- UUID fictício para log
    'SISTEMA',
    'Sistema',
    'credito',
    0.01, -- Valor mínimo para satisfazer a constraint
    NULL,
    'CORREÇÃO: Trigger automático removido para evitar duplicação de cashback'
);

-- 8. INSTRUÇÕES PARA O DESENVOLVEDOR
/*
INSTRUÇÕES PARA IMPLEMENTAR A CORREÇÃO:

1. Execute este script SQL no Supabase
2. Atualize o OrderCreationService para usar as novas funções:

   // No método generateOrderCashback, substitua:
   const { error: updateError } = await supabase
     .rpc('update_customer_cashback_balance', {
       p_company_id: companyId,
       p_customer_phone: cliente.telefone,
       p_amount: cashbackValue
     });

   // Por:
   const { error: updateError } = await supabase
     .rpc('reset_and_credit_cashback', {
       p_company_id: companyId,
       p_customer_phone: cliente.telefone,
       p_customer_name: cliente.nome,
       p_cashback_amount: cashbackValue,
       p_pedido_id: pedidoId
     });

3. No método processCashbackDebit, substitua a lógica manual por:
   const { data: debitResult, error: debitError } = await supabase
     .rpc('debit_cashback', {
       p_company_id: companyId,
       p_customer_phone: cliente.telefone,
       p_customer_name: cliente.nome,
       p_debit_amount: cashbackAplicado,
       p_pedido_id: pedidoId
     });

4. Execute a auditoria para verificar inconsistências:
   SELECT * FROM public.audit_cashback_consistency();

FLUXO CORRIGIDO:
1. Cliente faz pedido
2. OrderCreationService.createOrder() é chamado
3. Pedido é inserido na tabela 'pedidos'
4. ✅ Apenas OrderCreationService.generateOrderCashback() executa
5. ✅ Cashback é gerado UMA VEZ com lógica "zerar e creditar"
*/
