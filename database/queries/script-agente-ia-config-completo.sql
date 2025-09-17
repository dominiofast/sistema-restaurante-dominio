-- 🤖 SCRIPT COMPLETO: Sistema de Configuração Automática do Agente IA
-- Data: 2025-01-27
-- Execute este script no SQL Editor do Supabase

-- ==============================================
-- 1. CRIAR TABELA AI_AGENTS_CONFIG
-- ==============================================

-- Criar tabela ai_agents_config se não existir
CREATE TABLE IF NOT EXISTS ai_agents_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    cardapio_url TEXT,
    knowledge_base TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Garantir que cada empresa tenha apenas uma configuração
    UNIQUE(company_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_agents_config_company_id ON ai_agents_config(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_config_active ON ai_agents_config(is_active);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp_ai_agents_config()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger se não existir
DROP TRIGGER IF EXISTS set_timestamp_ai_agents_config ON ai_agents_config;
CREATE TRIGGER set_timestamp_ai_agents_config
    BEFORE UPDATE ON ai_agents_config
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp_ai_agents_config();

-- ==============================================
-- 2. ADICIONAR CAMPO SLUG ÀS EMPRESAS
-- ==============================================

-- Adicionar coluna slug se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'slug'
    ) THEN
        ALTER TABLE companies ADD COLUMN slug VARCHAR(100) UNIQUE;
    END IF;
END $$;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);

-- Função para gerar slug único
CREATE OR REPLACE FUNCTION generate_company_slug(company_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Converter nome para slug
    base_slug := lower(company_name);
    base_slug := regexp_replace(base_slug, '[àáâãäå]', 'a', 'g');
    base_slug := regexp_replace(base_slug, '[èéêë]', 'e', 'g');
    base_slug := regexp_replace(base_slug, '[ìíîï]', 'i', 'g');
    base_slug := regexp_replace(base_slug, '[òóôõöø]', 'o', 'g');
    base_slug := regexp_replace(base_slug, '[ùúûü]', 'u', 'g');
    base_slug := regexp_replace(base_slug, '[ç]', 'c', 'g');
    base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    final_slug := base_slug;
    
    -- Garantir unicidade
    WHILE EXISTS (SELECT 1 FROM companies WHERE slug = final_slug) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Popular slugs para empresas existentes
DO $$
DECLARE
    company_record RECORD;
BEGIN
    FOR company_record IN 
        SELECT id, name FROM companies 
        WHERE slug IS NULL OR slug = ''
    LOOP
        UPDATE companies 
        SET slug = generate_company_slug(company_record.name)
        WHERE id = company_record.id;
    END LOOP;
END $$;

-- Trigger para gerar slug automaticamente
CREATE OR REPLACE FUNCTION trigger_generate_company_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_company_slug(NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_companies_generate_slug ON companies;
CREATE TRIGGER trigger_companies_generate_slug
    BEFORE INSERT OR UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_company_slug();

-- ==============================================
-- 3. CONFIGURAR RLS (ROW LEVEL SECURITY)
-- ==============================================

-- Habilitar RLS na tabela ai_agents_config
ALTER TABLE ai_agents_config ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso baseado na empresa do usuário
CREATE POLICY "Empresas podem gerenciar suas configurações de agente IA"
ON ai_agents_config
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM companies c
        WHERE c.id = ai_agents_config.company_id
        AND (
            -- Super admin pode ver todas as configurações
            auth.jwt() ->> 'user_metadata' ->> 'role' = 'super_admin'
            OR
            -- Usuário da empresa pode ver configurações da sua empresa
            auth.jwt() ->> 'user_metadata' ->> 'company_domain' = c.domain
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM companies c
        WHERE c.id = ai_agents_config.company_id
        AND (
            -- Super admin pode criar/editar todas as configurações
            auth.jwt() ->> 'user_metadata' ->> 'role' = 'super_admin'
            OR
            -- Usuário da empresa pode criar/editar configurações da sua empresa
            auth.jwt() ->> 'user_metadata' ->> 'company_domain' = c.domain
        )
    )
);

-- ==============================================
-- 4. COMENTÁRIOS EXPLICATIVOS
-- ==============================================

COMMENT ON TABLE ai_agents_config IS 'Configurações automáticas dos agentes IA por empresa';
COMMENT ON COLUMN ai_agents_config.company_id IS 'ID da empresa proprietária do agente IA';
COMMENT ON COLUMN ai_agents_config.cardapio_url IS 'URL personalizada do cardápio da empresa';
COMMENT ON COLUMN ai_agents_config.knowledge_base IS 'Base de conhecimento gerada automaticamente com produtos e informações da empresa';
COMMENT ON COLUMN ai_agents_config.is_active IS 'Se a configuração está ativa e deve ser usada pelo agente';

COMMENT ON COLUMN companies.slug IS 'Slug único da empresa para URLs personalizadas';

-- ==============================================
-- 5. VERIFICAÇÃO FINAL
-- ==============================================

DO $$
BEGIN
    -- Verificar se as tabelas foram criadas
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_agents_config') THEN
        RAISE NOTICE '✅ Tabela ai_agents_config criada com sucesso';
    ELSE
        RAISE EXCEPTION '❌ Erro: Tabela ai_agents_config não foi criada';
    END IF;
    
    -- Verificar se o campo slug existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'slug') THEN
        RAISE NOTICE '✅ Campo slug adicionado às empresas com sucesso';
    ELSE
        RAISE EXCEPTION '❌ Erro: Campo slug não foi adicionado';
    END IF;
    
    -- Mostrar estatísticas
    RAISE NOTICE '📊 Empresas com slug: %', (SELECT COUNT(*) FROM companies WHERE slug IS NOT NULL);
    RAISE NOTICE '🤖 Configurações de agente existentes: %', (SELECT COUNT(*) FROM ai_agents_config);
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SISTEMA DE CONFIGURAÇÃO AUTOMÁTICA DO AGENTE IA INSTALADO COM SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Próximos passos:';
    RAISE NOTICE '1. Acesse: Configuração → Agente IA → aba Recursos';
    RAISE NOTICE '2. Clique em: "Configurar Agente Automaticamente"';
    RAISE NOTICE '3. Confirme a ação no modal';
    RAISE NOTICE '4. ✨ Seu agente estará configurado!';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 URLs serão: https://pedido.dominio.tech/[slug-da-empresa]';
END $$; 