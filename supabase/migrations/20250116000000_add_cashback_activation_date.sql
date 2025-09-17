-- Adicionar coluna activated_at para controlar quando o cashback foi ativado
ALTER TABLE public.cashback_config 
ADD COLUMN activated_at TIMESTAMP WITH TIME ZONE;

-- Atualizar registros existentes para definir activated_at como a data atual quando is_active = true
UPDATE public.cashback_config 
SET activated_at = now() 
WHERE is_active = true AND activated_at IS NULL;

-- Remover o trigger existente
DROP TRIGGER IF EXISTS process_order_cashback ON public.pedidos;

-- Recriar a função com verificação de data de ativação
CREATE OR REPLACE FUNCTION public.process_cashback_for_order()
RETURNS TRIGGER AS $$
DECLARE
    config_rec RECORD;
    cashback_valor DECIMAL(10,2);
    existing_customer RECORD;
BEGIN
    -- Buscar configuração de cashback da empresa
    SELECT * INTO config_rec 
    FROM public.cashback_config 
    WHERE company_id = NEW.company_id AND is_active = true;
    
    -- Se não há configuração ativa, não processar cashback
    IF NOT FOUND OR config_rec.percentual_cashback = 0 THEN
        RETURN NEW;
    END IF;
    
    -- Verificar se o cashback foi ativado e se o pedido foi criado após a ativação
    IF config_rec.activated_at IS NULL OR NEW.created_at < config_rec.activated_at THEN
        RETURN NEW;
    END IF;
    
    -- Verificar se o pedido atende ao valor mínimo
    IF NEW.total IS NULL OR NEW.total < config_rec.valor_minimo_compra THEN
        RETURN NEW;
    END IF;
    
    -- Calcular valor do cashback
    cashback_valor := (NEW.total * config_rec.percentual_cashback / 100);
    
    -- Verificar se cliente já existe
    SELECT * INTO existing_customer 
    FROM public.customer_cashback 
    WHERE company_id = NEW.company_id AND customer_phone = NEW.telefone;
    
    IF FOUND THEN
        -- Atualizar saldo existente
        UPDATE public.customer_cashback 
        SET 
            saldo_disponivel = saldo_disponivel + cashback_valor,
            saldo_total_acumulado = saldo_total_acumulado + cashback_valor,
            customer_name = COALESCE(NEW.nome, customer_name),
            updated_at = now()
        WHERE company_id = NEW.company_id AND customer_phone = NEW.telefone;
    ELSE
        -- Criar novo registro de cashback
        INSERT INTO public.customer_cashback (
            company_id, 
            customer_phone, 
            customer_name, 
            saldo_disponivel, 
            saldo_total_acumulado
        ) VALUES (
            NEW.company_id, 
            NEW.telefone, 
            NEW.nome, 
            cashback_valor, 
            cashback_valor
        );
    END IF;
    
    -- Registrar transação
    INSERT INTO public.cashback_transactions (
        company_id,
        customer_phone,
        customer_name,
        tipo,
        valor,
        pedido_id,
        descricao
    ) VALUES (
        NEW.company_id,
        NEW.telefone,
        NEW.nome,
        'credito',
        cashback_valor,
        NEW.id,
        'Cashback do pedido #' || NEW.id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar o trigger
CREATE TRIGGER process_order_cashback
    AFTER INSERT ON public.pedidos
    FOR EACH ROW
    WHEN (NEW.telefone IS NOT NULL AND NEW.total IS NOT NULL)
    EXECUTE FUNCTION public.process_cashback_for_order();

-- Criar trigger para atualizar activated_at quando is_active muda para true
CREATE OR REPLACE FUNCTION public.update_cashback_activation()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o cashback está sendo ativado (mudou de false para true)
    IF OLD.is_active = false AND NEW.is_active = true THEN
        NEW.activated_at = now();
    -- Se o cashback está sendo desativado (mudou de true para false)
    ELSIF OLD.is_active = true AND NEW.is_active = false THEN
        NEW.activated_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar activated_at automaticamente
CREATE TRIGGER update_cashback_activation_trigger
    BEFORE UPDATE ON public.cashback_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_cashback_activation();