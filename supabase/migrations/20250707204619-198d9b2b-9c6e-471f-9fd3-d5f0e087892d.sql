-- Recrear tabela ifood_app_config com estrutura correta
DROP TABLE IF EXISTS ifood_app_config CASCADE;

CREATE TABLE ifood_app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name VARCHAR(255) NOT NULL,
  client_id VARCHAR(255) NOT NULL, -- iFood Client ID como string (UUID format)
  client_secret VARCHAR(255) NOT NULL, -- iFood Client Secret é string alfanumérica
  environment VARCHAR(20) NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_ifood_app_config_environment ON ifood_app_config(environment);
CREATE INDEX idx_ifood_app_config_active ON ifood_app_config(is_active);
CREATE UNIQUE INDEX idx_ifood_app_config_client_id ON ifood_app_config(client_id);

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