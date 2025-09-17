-- VERIFICAR E CORRIGIR DADOS INCONSISTENTES DE CASHBACK
-- Execute este script APÓS aplicar a correção principal

-- 1. VERIFICAR INCONSISTÊNCIAS ATUAIS
SELECT 
    'INCONSISTÊNCIAS ENCONTRADAS:' as status,
    COUNT(*) as total_inconsistencias
FROM public.audit_cashback_consistency();

-- 2. MOSTRAR DETALHES DAS INCONSISTÊNCIAS
SELECT 
    cc.company_id,
    cc.customer_phone,
    cc.saldo_disponivel as saldo_atual,
    COALESCE(creditos.total_creditos, 0) as total_creditos,
    COALESCE(debitos.total_debitos, 0) as total_debitos,
    (COALESCE(creditos.total_creditos, 0) - COALESCE(debitos.total_debitos, 0)) as saldo_calculado,
    (cc.saldo_disponivel - (COALESCE(creditos.total_creditos, 0) - COALESCE(debitos.total_debitos, 0))) as diferenca,
    CASE 
        WHEN cc.saldo_disponivel > (COALESCE(creditos.total_creditos, 0) - COALESCE(debitos.total_debitos, 0)) 
        THEN 'SALDO MAIOR QUE DEVERIA'
        ELSE 'SALDO MENOR QUE DEVERIA'
    END as tipo_inconsistencia
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
WHERE ABS(cc.saldo_disponivel - (COALESCE(creditos.total_creditos, 0) - COALESCE(debitos.total_debitos, 0))) > 0.01
ORDER BY ABS(cc.saldo_disponivel - (COALESCE(creditos.total_creditos, 0) - COALESCE(debitos.total_debitos, 0))) DESC;

-- 3. CORRIGIR INCONSISTÊNCIAS (OPCIONAL - DESCOMENTE SE NECESSÁRIO)
/*
-- ATENÇÃO: Esta correção ajusta os saldos para refletir as transações reais
-- Execute apenas se você tem certeza de que as transações estão corretas

UPDATE public.customer_cashback 
SET 
    saldo_disponivel = (
        SELECT COALESCE(SUM(CASE WHEN tipo = 'credito' THEN valor ELSE -valor END), 0)
        FROM public.cashback_transactions ct
        WHERE ct.company_id = customer_cashback.company_id 
        AND ct.customer_phone = customer_cashback.customer_phone
    ),
    updated_at = now()
WHERE id IN (
    SELECT cc.id
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
    WHERE ABS(cc.saldo_disponivel - (COALESCE(creditos.total_creditos, 0) - COALESCE(debitos.total_debitos, 0))) > 0.01
);

-- Registrar correção nas transações
INSERT INTO public.cashback_transactions (
    company_id,
    customer_phone,
    customer_name,
    tipo,
    valor,
    pedido_id,
    descricao
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'SISTEMA',
    'Sistema',
    'credito',
    0.01, -- Valor mínimo para satisfazer a constraint check_valor_positivo
    NULL,
    'CORREÇÃO: Saldos ajustados para refletir transações reais'
);
*/

-- 4. VERIFICAR TRANSAÇÕES DUPLICADAS (possível causa do problema)
SELECT 
    company_id,
    customer_phone,
    pedido_id,
    COUNT(*) as total_transacoes,
    SUM(CASE WHEN tipo = 'credito' THEN valor ELSE 0 END) as total_creditos,
    SUM(CASE WHEN tipo = 'debito' THEN valor ELSE 0 END) as total_debitos,
    created_at::date as data
FROM public.cashback_transactions 
WHERE pedido_id IS NOT NULL
GROUP BY company_id, customer_phone, pedido_id, created_at::date
HAVING COUNT(*) > 2 -- Mais de 2 transações por pedido pode indicar duplicação
ORDER BY COUNT(*) DESC;

-- 5. VERIFICAR TRANSAÇÕES RECENTES (últimas 24 horas)
SELECT 
    ct.company_id,
    ct.customer_phone,
    ct.tipo,
    ct.valor,
    ct.pedido_id,
    ct.descricao,
    ct.created_at,
    cc.saldo_disponivel as saldo_atual
FROM public.cashback_transactions ct
LEFT JOIN public.customer_cashback cc 
    ON ct.company_id = cc.company_id 
    AND ct.customer_phone = cc.customer_phone
WHERE ct.created_at >= now() - interval '24 hours'
ORDER BY ct.created_at DESC;

-- 6. RESUMO ESTATÍSTICO
SELECT 
    'RESUMO CASHBACK' as tipo,
    COUNT(DISTINCT cc.company_id) as total_empresas,
    COUNT(DISTINCT cc.customer_phone) as total_clientes,
    SUM(cc.saldo_disponivel) as saldo_total_disponivel,
    SUM(cc.saldo_total_acumulado) as saldo_total_acumulado
FROM public.customer_cashback cc
UNION ALL
SELECT 
    'TRANSAÇÕES' as tipo,
    COUNT(DISTINCT ct.company_id) as total_empresas,
    COUNT(DISTINCT ct.customer_phone) as total_clientes,
    SUM(CASE WHEN ct.tipo = 'credito' THEN ct.valor ELSE 0 END) as total_creditos,
    SUM(CASE WHEN ct.tipo = 'debito' THEN ct.valor ELSE 0 END) as total_debitos
FROM public.cashback_transactions ct;

-- 7. INSTRUÇÕES PARA MONITORAMENTO
/*
INSTRUÇÕES PARA MONITORAMENTO CONTÍNUO:

1. Execute este script regularmente para verificar inconsistências:
   SELECT * FROM public.audit_cashback_consistency();

2. Monitore transações duplicadas:
   - Verifique se há mais de 2 transações por pedido
   - Investigar se o trigger automático ainda está ativo

3. Verifique logs de erro no console do navegador:
   - Procure por erros relacionados a cashback
   - Verifique se as funções RPC estão sendo chamadas corretamente

4. Teste o fluxo completo:
   - Faça um pedido com cashback
   - Verifique se apenas UMA transação de crédito foi criada
   - Confirme se o saldo está correto

5. Se encontrar inconsistências:
   - Execute a correção (descomente a seção 3)
   - Monitore os próximos pedidos
   - Verifique se o problema foi resolvido
*/
