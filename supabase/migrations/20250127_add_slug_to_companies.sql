-- Migração para adicionar slug à tabela companies
-- Data: 2025-01-27
-- Descrição: Campo slug único para URLs personalizadas por empresa

-- Adicionar coluna slug se não existir
DO $$ 
BEGIN
    -- Verificar se a coluna slug já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'slug'
    ) THEN
        -- Adicionar coluna slug
        ALTER TABLE companies ADD COLUMN slug VARCHAR(100) UNIQUE;
        
        -- Índice para busca rápida por slug
        CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
        
        RAISE NOTICE 'Coluna slug adicionada à tabela companies';
    ELSE
        RAISE NOTICE 'Coluna slug já existe na tabela companies';
    END IF;
END $$;

-- Função para gerar slug baseado no nome da empresa
CREATE OR REPLACE FUNCTION generate_company_slug(company_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Converter nome para slug básico
    base_slug := LOWER(TRIM(company_name));
    
    -- Remover caracteres especiais e substituir espaços por hífens
    base_slug := REGEXP_REPLACE(base_slug, '[àáâãäå]', 'a', 'g');
    base_slug := REGEXP_REPLACE(base_slug, '[èéêë]', 'e', 'g');
    base_slug := REGEXP_REPLACE(base_slug, '[ìíîï]', 'i', 'g');
    base_slug := REGEXP_REPLACE(base_slug, '[òóôõö]', 'o', 'g');
    base_slug := REGEXP_REPLACE(base_slug, '[ùúûü]', 'u', 'g');
    base_slug := REGEXP_REPLACE(base_slug, '[ç]', 'c', 'g');
    base_slug := REGEXP_REPLACE(base_slug, '[ñ]', 'n', 'g');
    base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9\s-]', '', 'g');
    base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
    base_slug := REGEXP_REPLACE(base_slug, '-+', '-', 'g');
    base_slug := TRIM(base_slug, '-');
    
    -- Garantir que não seja vazio
    IF LENGTH(base_slug) = 0 THEN
        base_slug := 'empresa';
    END IF;
    
    -- Limitar o tamanho
    base_slug := LEFT(base_slug, 80);
    
    final_slug := base_slug;
    
    -- Verificar se já existe e adicionar número se necessário
    WHILE EXISTS (SELECT 1 FROM companies WHERE slug = final_slug) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Gerar slugs para empresas existentes que não têm slug
DO $$
DECLARE
    company_record RECORD;
    new_slug TEXT;
BEGIN
    FOR company_record IN 
        SELECT id, name FROM companies WHERE slug IS NULL OR slug = ''
    LOOP
        -- Gerar slug único para cada empresa
        new_slug := generate_company_slug(company_record.name);
        
        -- Atualizar empresa com o novo slug
        UPDATE companies 
        SET slug = new_slug 
        WHERE id = company_record.id;
        
        RAISE NOTICE 'Slug gerado para empresa "%": %', company_record.name, new_slug;
    END LOOP;
END $$;

-- Trigger para gerar slug automaticamente em novas empresas
CREATE OR REPLACE FUNCTION trigger_generate_company_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Se não foi fornecido slug, gerar automaticamente
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_company_slug(NEW.name);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DO $$
BEGIN
    -- Remover trigger se já existir
    DROP TRIGGER IF EXISTS trigger_companies_generate_slug ON companies;
    
    -- Criar novo trigger
    CREATE TRIGGER trigger_companies_generate_slug
        BEFORE INSERT OR UPDATE ON companies
        FOR EACH ROW
        WHEN (NEW.slug IS NULL OR NEW.slug = '')
        EXECUTE FUNCTION trigger_generate_company_slug();
        
    RAISE NOTICE 'Trigger para geração automática de slug criado';
END $$;

-- Comentários explicativos
COMMENT ON COLUMN companies.slug IS 'Slug único da empresa para URLs personalizadas (ex: dominio-pizzas)';
COMMENT ON FUNCTION generate_company_slug(TEXT) IS 'Gera slug único baseado no nome da empresa';
COMMENT ON FUNCTION trigger_generate_company_slug() IS 'Trigger para gerar slug automaticamente';

-- Verificação final
DO $$
BEGIN
    RAISE NOTICE 'Migração concluída. Total de empresas com slug: %', 
        (SELECT COUNT(*) FROM companies WHERE slug IS NOT NULL AND slug != '');
END $$; 