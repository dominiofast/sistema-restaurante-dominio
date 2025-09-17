-- Criar tabela de configuração de cashback por empresa
CREATE TABLE public.cashback_config (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    percentual_cashback DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- Ex: 5.50 para 5.5%
    valor_minimo_compra DECIMAL(10,2) DEFAULT 0.00, -- Valor mínimo para gerar cashback
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(company_id)
);

-- Criar tabela de saldo de cashback dos clientes
CREATE TABLE public.customer_cashback (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    customer_phone VARCHAR(20) NOT NULL, -- Usando telefone como identificador do cliente
    customer_name TEXT,
    saldo_disponivel DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    saldo_total_acumulado DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(company_id, customer_phone)
);

-- Criar tabela de histórico de transações de cashback
CREATE TABLE public.cashback_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    customer_phone VARCHAR(20) NOT NULL,
    customer_name TEXT,
    tipo VARCHAR(20) NOT NULL, -- 'credito' ou 'debito'
    valor DECIMAL(10,2) NOT NULL,
    pedido_id INTEGER REFERENCES public.pedidos(id),
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.cashback_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_cashback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashback_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cashback_config
CREATE POLICY "Users can view their company cashback config" 
ON public.cashback_config FOR SELECT 
USING (company_id IN (SELECT id FROM companies));

CREATE POLICY "Users can insert their company cashback config" 
ON public.cashback_config FOR INSERT 
WITH CHECK (company_id IN (SELECT id FROM companies));

CREATE POLICY "Users can update their company cashback config" 
ON public.cashback_config FOR UPDATE 
USING (company_id IN (SELECT id FROM companies));

-- Políticas RLS para customer_cashback
CREATE POLICY "Users can view their company customer cashback" 
ON public.customer_cashback FOR SELECT 
USING (company_id IN (SELECT id FROM companies));

CREATE POLICY "Users can insert their company customer cashback" 
ON public.customer_cashback FOR INSERT 
WITH CHECK (company_id IN (SELECT id FROM companies));

CREATE POLICY "Users can update their company customer cashback" 
ON public.customer_cashback FOR UPDATE 
USING (company_id IN (SELECT id FROM companies));

-- Políticas RLS para cashback_transactions
CREATE POLICY "Users can view their company cashback transactions" 
ON public.cashback_transactions FOR SELECT 
USING (company_id IN (SELECT id FROM companies));

CREATE POLICY "Users can insert their company cashback transactions" 
ON public.cashback_transactions FOR INSERT 
WITH CHECK (company_id IN (SELECT id FROM companies));

-- Triggers para updated_at
CREATE TRIGGER update_cashback_config_updated_at
    BEFORE UPDATE ON public.cashback_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_cashback_updated_at
    BEFORE UPDATE ON public.customer_cashback
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Função para processar cashback automaticamente
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

-- Trigger para processar cashback após inserir pedido
CREATE TRIGGER process_order_cashback
    AFTER INSERT ON public.pedidos
    FOR EACH ROW
    WHEN (NEW.telefone IS NOT NULL AND NEW.total IS NOT NULL)
    EXECUTE FUNCTION public.process_cashback_for_order();