-- Migração para tabela de configurações do Agente IA
-- Data: 2025-01-27
-- Descrição: Tabela para armazenar configurações automáticas dos agentes IA por empresa

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
DO $$
BEGIN
    DROP TRIGGER IF EXISTS set_timestamp_ai_agents_config ON ai_agents_config;
    CREATE TRIGGER set_timestamp_ai_agents_config
        BEFORE UPDATE ON ai_agents_config
        FOR EACH ROW
        EXECUTE FUNCTION trigger_set_timestamp_ai_agents_config();
END $$;

-- RLS (Row Level Security)
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

-- Comentários explicativos
COMMENT ON TABLE ai_agents_config IS 'Configurações automáticas dos agentes IA por empresa';
COMMENT ON COLUMN ai_agents_config.company_id IS 'ID da empresa proprietária do agente IA';
COMMENT ON COLUMN ai_agents_config.cardapio_url IS 'URL personalizada do cardápio da empresa';
COMMENT ON COLUMN ai_agents_config.knowledge_base IS 'Base de conhecimento gerada automaticamente com produtos e informações da empresa';
COMMENT ON COLUMN ai_agents_config.is_active IS 'Se a configuração está ativa e deve ser usada pelo agente';

-- Verificação final
DO $$
BEGIN
    RAISE NOTICE 'Tabela ai_agents_config criada com sucesso';
    RAISE NOTICE 'RLS configurado para controle de acesso por empresa';
    RAISE NOTICE 'Triggers para updated_at configurados';
END $$; 