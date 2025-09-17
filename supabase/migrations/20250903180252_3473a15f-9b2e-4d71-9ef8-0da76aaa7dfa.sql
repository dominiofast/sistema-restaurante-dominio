-- CORREÇÃO DEFINITIVA DO SISTEMA DE CASHBACK
-- 
-- PROBLEMA IDENTIFICADO:
-- O CashbackService.ts está atualizando diretamente customer_cashback.saldo_disponivel
-- causando dessincronia com as transações registradas em cashback_transactions
-- 
-- SOLUÇÃO:
-- 1. Criar trigger que recalcula saldos automaticamente
-- 2. Remover permissões para atualizações diretas de saldo
-- 3. Garantir que apenas transações controlem os saldos

-- 1. CRIAR FUNÇÃO PARA RECALCULAR SALDO AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.auto_recalculate_cashback_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalcular saldo baseado em todas as transações do cliente
    UPDATE customer_cashback 
    SET 
        saldo_disponivel = (
            SELECT COALESCE(SUM(
                CASE 
                    WHEN ct.tipo = 'credito' THEN ct.valor 
                    WHEN ct.tipo = 'debito' THEN -ct.valor 
                    ELSE 0 
                END
            ), 0)
            FROM cashback_transactions ct 
            WHERE ct.company_id = COALESCE(NEW.company_id, OLD.company_id)
            AND ct.customer_phone = COALESCE(NEW.customer_phone, OLD.customer_phone)
        ),
        saldo_total_acumulado = (
            SELECT COALESCE(SUM(ct.valor), 0)
            FROM cashback_transactions ct 
            WHERE ct.company_id = COALESCE(NEW.company_id, OLD.company_id)
            AND ct.customer_phone = COALESCE(NEW.customer_phone, OLD.customer_phone)
            AND ct.tipo = 'credito'
        ),
        updated_at = now()
    WHERE company_id = COALESCE(NEW.company_id, OLD.company_id)
    AND customer_phone = COALESCE(NEW.customer_phone, OLD.customer_phone);
    
    -- Se o cliente não existe na tabela customer_cashback, criar registro
    IF NOT FOUND AND NEW.tipo = 'credito' THEN
        INSERT INTO customer_cashback (
            company_id, 
            customer_phone, 
            customer_name,
            saldo_disponivel, 
            saldo_total_acumulado
        ) VALUES (
            NEW.company_id,
            NEW.customer_phone,
            NEW.customer_name,
            NEW.valor,
            NEW.valor
        )
        ON CONFLICT (company_id, customer_phone) DO UPDATE SET
            saldo_disponivel = (
                SELECT COALESCE(SUM(
                    CASE 
                        WHEN ct.tipo = 'credito' THEN ct.valor 
                        WHEN ct.tipo = 'debito' THEN -ct.valor 
                        ELSE 0 
                    END
                ), 0)
                FROM cashback_transactions ct 
                WHERE ct.company_id = NEW.company_id
                AND ct.customer_phone = NEW.customer_phone
            ),
            saldo_total_acumulado = (
                SELECT COALESCE(SUM(ct.valor), 0)
                FROM cashback_transactions ct 
                WHERE ct.company_id = NEW.company_id
                AND ct.customer_phone = NEW.customer_phone
                AND ct.tipo = 'credito'
            ),
            customer_name = NEW.customer_name,
            updated_at = now();
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CRIAR TRIGGER PARA RECÁLCULO AUTOMÁTICO
DROP TRIGGER IF EXISTS trigger_auto_recalculate_cashback ON cashback_transactions;

CREATE TRIGGER trigger_auto_recalculate_cashback
    AFTER INSERT OR UPDATE OR DELETE ON cashback_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_recalculate_cashback_balance();

-- 3. AJUSTAR PERMISSÕES - Remover permissões diretas para customer_cashback
-- Agora apenas transações devem alterar saldos
DROP POLICY IF EXISTS "Authenticated users can update customer cashback" ON customer_cashback;
DROP POLICY IF EXISTS "Users can update their company customer cashback" ON customer_cashback;

-- Permitir apenas consulta e inserção inicial
CREATE POLICY "Read customer cashback policy" ON customer_cashback
    FOR SELECT USING (true);

CREATE POLICY "Insert customer cashback policy" ON customer_cashback  
    FOR INSERT WITH CHECK (true);

-- 4. CORRIGIR FUNÇÃO recalculate_cashback_balance PARA USAR SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.recalculate_cashback_balance(p_company_id uuid, p_customer_phone character varying)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER  -- Esta linha é crucial para contornar RLS
SET search_path = public
AS $$
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
$$;

-- 5. RECALCULAR SALDO DO CLIENTE PROBLEMA
SELECT recalculate_cashback_balance('11e10dba-8ed0-47fc-91f5-bc88f2aef4ca', '69992254080') as resultado_final;

-- 6. LOG DE IMPLEMENTAÇÃO
INSERT INTO ai_conversation_logs (
    company_id, customer_phone, customer_name, message_content, message_type, created_at
) VALUES (
    '11e10dba-8ed0-47fc-91f5-bc88f2aef4ca', 'SYSTEM', 'CASHBACK_SYSTEM',
    '🔧 CORREÇÃO DEFINITIVA IMPLEMENTADA: Sistema de cashback agora é 100% baseado em transações. Trigger automático implementado para recálculo de saldos. Atualizações diretas de saldo removidas.',
    'cashback_system_fixed', now()
);