-- Tabela para configurar a página de vagas de cada empresa
CREATE TABLE rh_vagas_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT FALSE NOT NULL,
    page_title TEXT,
    welcome_message TEXT,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#1B365D',
    slug TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE rh_vagas_config ENABLE ROW LEVEL SECURITY;

-- Política de acesso: permitir que usuários gerenciem a configuração de sua própria empresa.
CREATE POLICY "Enable all actions for users based on company_id"
ON rh_vagas_config
FOR ALL
USING (company_id = (SELECT auth.uid() FROM companies WHERE id = company_id))
WITH CHECK (company_id = (SELECT auth.uid() FROM companies WHERE id = company_id));

-- Adicionar um gatilho para gerar o 'slug' a partir do nome da empresa
-- Esta função será executada antes de inserir ou atualizar um registro
CREATE OR REPLACE FUNCTION generate_company_slug_for_vagas()
RETURNS TRIGGER AS $$
BEGIN
    -- Se a empresa já tem um slug, use-o
    SELECT slug INTO NEW.slug FROM companies WHERE id = NEW.company_id;
    
    -- Se ainda não tem, gere um a partir do nome
    IF NEW.slug IS NULL THEN
        NEW.slug := lower(regexp_replace(
            (SELECT name FROM companies WHERE id = NEW.company_id),
            '[^a-zA-Z0-9]+', '-', 'g'
        ));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_slug_before_insert_on_vagas_config
BEFORE INSERT ON rh_vagas_config
FOR EACH ROW
EXECUTE FUNCTION generate_company_slug_for_vagas(); 