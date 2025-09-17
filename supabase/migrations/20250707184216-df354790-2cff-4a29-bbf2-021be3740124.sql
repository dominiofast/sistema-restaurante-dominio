-- Criar tabela para configuração global do app iFood
CREATE TABLE IF NOT EXISTS public.ifood_app_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_name VARCHAR(255) NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  client_secret TEXT NOT NULL,
  environment VARCHAR(50) NOT NULL DEFAULT 'sandbox',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- RLS para apenas super admins gerenciarem a config global
ALTER TABLE public.ifood_app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage global ifood app config" 
ON public.ifood_app_config 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'super_admin'
    )
);

-- Modificar tabela ifood_integrations para ser apenas merchant por empresa
ALTER TABLE public.ifood_integrations 
DROP COLUMN IF EXISTS client_id,
DROP COLUMN IF EXISTS client_secret,
DROP COLUMN IF EXISTS integration_name,
DROP COLUMN IF EXISTS webhook_url,
DROP COLUMN IF EXISTS environment;

-- Adicionar referência à config global
ALTER TABLE public.ifood_integrations 
ADD COLUMN IF NOT EXISTS ifood_app_config_id UUID REFERENCES public.ifood_app_config(id),
ADD COLUMN IF NOT EXISTS store_name VARCHAR(255);

-- Comentários para documentação
COMMENT ON TABLE public.ifood_app_config IS 'Configuração global do app iFood (clientId/clientSecret)';
COMMENT ON TABLE public.ifood_integrations IS 'Configuração por empresa (apenas merchant_id da loja)';
COMMENT ON COLUMN public.ifood_integrations.merchant_id IS 'ID único da loja no iFood';
COMMENT ON COLUMN public.ifood_integrations.store_name IS 'Nome da loja para identificação';