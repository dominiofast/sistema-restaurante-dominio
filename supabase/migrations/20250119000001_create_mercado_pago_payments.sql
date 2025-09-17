-- Criar tabela para rastrear pagamentos do Mercado Pago
CREATE TABLE IF NOT EXISTS public.mercado_pago_payments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Dados do pagamento no Mercado Pago
    payment_id text NOT NULL UNIQUE, -- ID do pagamento no Mercado Pago
    external_reference text, -- Referência externa (ID do pedido)
    
    -- Dados financeiros
    amount decimal(10,2) NOT NULL,
    currency text DEFAULT 'BRL',
    
    -- Status e dados PIX
    status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected, cancelled
    qr_code text, -- Código PIX
    qr_code_base64 text, -- QR Code em base64
    ticket_url text, -- URL do ticket
    
    -- Datas
    expires_at timestamp with time zone,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Dados do cliente (opcionais)
    customer_name text,
    customer_email text,
    customer_phone text,
    
    -- Metadados adicionais
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Criar índices para consultas otimizadas
CREATE INDEX IF NOT EXISTS idx_mercado_pago_payments_company_id ON public.mercado_pago_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_mercado_pago_payments_payment_id ON public.mercado_pago_payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_mercado_pago_payments_external_reference ON public.mercado_pago_payments(external_reference);
CREATE INDEX IF NOT EXISTS idx_mercado_pago_payments_status ON public.mercado_pago_payments(status);
CREATE INDEX IF NOT EXISTS idx_mercado_pago_payments_created_at ON public.mercado_pago_payments(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_mercado_pago_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_mercado_pago_payments_updated_at
    BEFORE UPDATE ON public.mercado_pago_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_mercado_pago_payments_updated_at();

-- Habilitar RLS
ALTER TABLE public.mercado_pago_payments ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários só podem acessar pagamentos de suas próprias empresas
CREATE POLICY "Users can manage their company's payments" ON public.mercado_pago_payments
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

-- Permitir que super admins vejam todos os pagamentos
CREATE POLICY "Super admins can manage all payments" ON public.mercado_pago_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
    );

-- Política para permitir inserções via service role (Supabase Functions)
CREATE POLICY "Allow service role to manage payments" ON public.mercado_pago_payments
    FOR ALL USING (auth.role() = 'service_role');
