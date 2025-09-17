-- ATIVAR CASHBACK PARA TODAS AS EMPRESAS
-- Este script cria configuração de cashback para empresas que não têm

-- 1. CRIAR CONFIGURAÇÃO DE CASHBACK PARA EMPRESAS SEM CONFIGURAÇÃO
INSERT INTO cashback_config (
    company_id,
    percentual_cashback,
    valor_minimo_compra,
    is_active,
    activated_at,
    created_at,
    updated_at
)
SELECT 
    c.id as company_id,
    10.00 as percentual_cashback, -- 10% de cashback
    0.00 as valor_minimo_compra,  -- Sem valor mínimo
    true as is_active,
    now() as activated_at,
    now() as created_at,
    now() as updated_at
FROM companies c
LEFT JOIN cashback_config cc ON c.id = cc.company_id
WHERE cc.id IS NULL
ON CONFLICT (company_id) DO NOTHING;

-- 2. ATIVAR CASHBACK PARA EMPRESAS COM CONFIGURAÇÃO INATIVA
UPDATE cashback_config 
SET 
    is_active = true,
    percentual_cashback = 10.00,
    valor_minimo_compra = 0.00,
    activated_at = COALESCE(activated_at, now()),
    updated_at = now()
WHERE is_active = false;

-- 3. VERIFICAR RESULTADO
SELECT 
    'CONFIGURAÇÕES ATIVADAS' as status,
    cc.company_id,
    c.name as company_name,
    cc.percentual_cashback,
    cc.valor_minimo_compra,
    cc.is_active,
    cc.activated_at
FROM cashback_config cc
JOIN companies c ON cc.company_id = c.id
ORDER BY c.name;

-- 4. VERIFICAR SE AINDA HÁ EMPRESAS SEM CONFIGURAÇÃO
SELECT 
    'EMPRESAS SEM CONFIGURAÇÃO' as status,
    c.id as company_id,
    c.name as company_name
FROM companies c
LEFT JOIN cashback_config cc ON c.id = cc.company_id
WHERE cc.id IS NULL;

-- 5. RECRIAR TRIGGER SE NECESSÁRIO
-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS process_order_cashback ON public.pedidos;

-- Recriar trigger para processar cashback automaticamente
CREATE TRIGGER process_order_cashback
    AFTER INSERT ON public.pedidos
    FOR EACH ROW
    WHEN (NEW.telefone IS NOT NULL AND NEW.total IS NOT NULL)
    EXECUTE FUNCTION public.process_cashback_for_order();

-- 6. VERIFICAR SE O TRIGGER FOI CRIADO
SELECT 
    'TRIGGER STATUS' as status,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'pedidos' 
  AND trigger_name = 'process_order_cashback';

-- 7. TESTE: VERIFICAR SE FUNÇÃO DE PROCESSAMENTO EXISTE
SELECT 
    'FUNÇÃO STATUS' as status,
    routine_name,
    routine_type,
    routine_schema
FROM information_schema.routines 
WHERE routine_name = 'process_cashback_for_order' 
  AND routine_type = 'FUNCTION';

-- 8. MENSAGEM FINAL
SELECT 
    'CASHBACK ATIVADO' as status,
    'Todas as empresas agora têm cashback ativo com 10% de desconto' as mensagem,
    'Faça um pedido para testar' as proximo_passo;
