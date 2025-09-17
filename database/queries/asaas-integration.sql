-- Criar tabela para configurações do Asaas
CREATE TABLE IF NOT EXISTS public.asaas_config (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Credenciais do Asaas
    api_key text, -- $aact_... (produção) ou $aact_YTU5YjFiNTQtNjQ2NC00... (sandbox)
    
    -- Configurações de PIX
    pix_enabled boolean DEFAULT true,
    
    -- Configurações de Cartão
    card_enabled boolean DEFAULT true,
    
    -- Configurações gerais
    is_active boolean DEFAULT false,
    sandbox_mode boolean DEFAULT true, -- Modo sandbox por padrão
    
    -- Webhook
    webhook_token text, -- Token para validar webhooks
    
    -- Metadados
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Garantir que cada empresa tenha apenas uma configuração
    UNIQUE(company_id)
);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_asaas_config_company_id ON public.asaas_config(company_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_asaas_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_asaas_config_updated_at
    BEFORE UPDATE ON public.asaas_config
    FOR EACH ROW
    EXECUTE FUNCTION update_asaas_config_updated_at();

-- RLS
ALTER TABLE public.asaas_config ENABLE ROW LEVEL SECURITY;

-- Política para usuários da empresa
CREATE POLICY "Users can manage their company's Asaas config" ON public.asaas_config
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

-- Política para service role
CREATE POLICY "Allow service role to manage Asaas config" ON public.asaas_config
    FOR ALL USING (auth.role() = 'service_role');
