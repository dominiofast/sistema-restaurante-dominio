-- Recrear tabela ifood_app_config com estrutura correta
DROP TABLE IF EXISTS ifood_app_config CASCADE;

CREATE TABLE ifood_app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name VARCHAR(255) NOT NULL,
  client_id UUID NOT NULL, -- iFood Client ID é sempre UUID
  client_secret VARCHAR(255) NOT NULL, -- iFood Client Secret é string alfanumérica
  environment VARCHAR(20) NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Garantir que só existe uma configuração ativa por ambiente
  CONSTRAINT unique_active_per_environment UNIQUE (environment, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Criar índices para performance
CREATE INDEX idx_ifood_app_config_environment ON ifood_app_config(environment);
CREATE INDEX idx_ifood_app_config_active ON ifood_app_config(is_active);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_ifood_app_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ifood_app_config_updated_at
    BEFORE UPDATE ON ifood_app_config
    FOR EACH ROW
    EXECUTE FUNCTION update_ifood_app_config_updated_at();

-- RLS Policies simples e funcionais
ALTER TABLE ifood_app_config ENABLE ROW LEVEL SECURITY;

-- Super admins podem fazer tudo
CREATE POLICY "Super admins full access to ifood app config"
ON ifood_app_config
FOR ALL
TO authenticated
USING (
  (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
)
WITH CHECK (
  (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
);

-- Todos usuários autenticados podem visualizar
CREATE POLICY "All authenticated can view ifood app config"
ON ifood_app_config
FOR SELECT
TO authenticated
USING (true);

-- Inserir configuração de exemplo com dados corretos do iFood
INSERT INTO ifood_app_config (
  app_name,
  client_id,
  client_secret,
  environment,
  is_active,
  notes
) VALUES (
  'DOMINIO BRANDS PIZZA E BURGER DELIVERY LTDA - Teste (D)',
  'dd4a4bf0-77a6-4b2a-b99b-46bd541e1f0',
  '15rbyr22qqkmxgh6af9m8wtp3m757hnn3xc3fi',
  'sandbox',
  true,
  'Configuração de teste baseada nas credenciais do iFood Developer'
);