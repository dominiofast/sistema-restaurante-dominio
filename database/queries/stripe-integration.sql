-- Criar tabela para configurações do Stripe
CREATE TABLE IF NOT EXISTS public.stripe_config (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Credenciais do Stripe
    publishable_key text, -- pk_test_... ou pk_live_...
    secret_key text, -- sk_test_... ou sk_live_...
    
    -- Configurações de PIX
    pix_enabled boolean DEFAULT true,
    
    -- Configurações de Cartão
    card_enabled boolean DEFAULT true,
    
    -- Configurações gerais
    is_active boolean DEFAULT false,
    test_mode boolean DEFAULT true, -- Modo teste por padrão
    
    -- Webhook
    webhook_endpoint_secret text, -- whsec_...
    
    -- Metadados
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Garantir que cada empresa tenha apenas uma configuração
    UNIQUE(company_id)
);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_stripe_config_company_id ON public.stripe_config(company_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_stripe_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_stripe_config_updated_at
    BEFORE UPDATE ON public.stripe_config
    FOR EACH ROW
    EXECUTE FUNCTION update_stripe_config_updated_at();

-- RLS
ALTER TABLE public.stripe_config ENABLE ROW LEVEL SECURITY;

-- Política para usuários da empresa
CREATE POLICY "Users can manage their company's Stripe config" ON public.stripe_config
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

-- Política para service role
CREATE POLICY "Allow service role to manage Stripe config" ON public.stripe_config
    FOR ALL USING (auth.role() = 'service_role');
