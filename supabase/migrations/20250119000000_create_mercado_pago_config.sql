-- Criar tabela para configurações do Mercado Pago
CREATE TABLE IF NOT EXISTS public.mercado_pago_config (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Credenciais do Mercado Pago
    access_token text,
    public_key text,
    
    -- Configurações de PIX
    pix_enabled boolean DEFAULT false,
    pix_expiration_minutes integer DEFAULT 30, -- Tempo de expiração do PIX em minutos
    
    -- Configurações gerais
    is_active boolean DEFAULT false,
    sandbox_mode boolean DEFAULT true, -- Modo sandbox por padrão
    
    -- Metadados
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Garantir que cada empresa tenha apenas uma configuração
    UNIQUE(company_id)
);

-- Criar índice para consultas por empresa
CREATE INDEX IF NOT EXISTS idx_mercado_pago_config_company_id ON public.mercado_pago_config(company_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_mercado_pago_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_mercado_pago_config_updated_at
    BEFORE UPDATE ON public.mercado_pago_config
    FOR EACH ROW
    EXECUTE FUNCTION update_mercado_pago_config_updated_at();

-- Habilitar RLS
ALTER TABLE public.mercado_pago_config ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários só podem acessar configurações de suas próprias empresas
CREATE POLICY "Users can manage their company's Mercado Pago config" ON public.mercado_pago_config
    FOR ALL USING (
        company_id IN (
            SELECT c.id FROM companies c
            JOIN company_users cu ON c.id = cu.company_id
            WHERE cu.user_id = auth.uid()
        )
    );

-- Permitir que super admins vejam todas as configurações
CREATE POLICY "Super admins can manage all Mercado Pago configs" ON public.mercado_pago_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
    );
