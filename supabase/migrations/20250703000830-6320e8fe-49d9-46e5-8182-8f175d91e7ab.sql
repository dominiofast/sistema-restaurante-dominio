-- Criar tabela para integrações do iFood
CREATE TABLE public.ifood_integrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    integration_name VARCHAR(255) NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    client_secret TEXT NOT NULL,
    merchant_id VARCHAR(255),
    webhook_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    environment VARCHAR(50) NOT NULL DEFAULT 'sandbox',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Enable RLS
ALTER TABLE public.ifood_integrations ENABLE ROW LEVEL SECURITY;

-- Policy para super admins gerenciarem todas as integrações
CREATE POLICY "Super admins can manage all ifood integrations" 
ON public.ifood_integrations 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'super_admin'
    )
);

-- Policy para lojistas verem apenas suas integrações
CREATE POLICY "Company users can view their ifood integrations" 
ON public.ifood_integrations 
FOR SELECT 
USING (
    company_id IN (
        SELECT c.id FROM companies c
        JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain
        WHERE u.id = auth.uid()
    )
);

-- Trigger para updated_at
CREATE TRIGGER update_ifood_integrations_updated_at
    BEFORE UPDATE ON public.ifood_integrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_ifood_integrations_company_id ON public.ifood_integrations(company_id);
CREATE INDEX idx_ifood_integrations_active ON public.ifood_integrations(is_active);