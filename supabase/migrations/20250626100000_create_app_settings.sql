-- Tabela para configurações globais da aplicação, como chaves de API.
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE app_settings IS 'Armazena configurações globais da aplicação, como chaves de API.';
COMMENT ON COLUMN app_settings.key IS 'A chave única da configuração (ex: "scrapingbee_api_key").';
COMMENT ON COLUMN app_settings.value IS 'O valor da configuração.';

-- Habilita RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Política para super admins poderem gerenciar as configurações
CREATE POLICY "Allow super admins to manage settings"
ON app_settings
FOR ALL
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin')
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin'); 