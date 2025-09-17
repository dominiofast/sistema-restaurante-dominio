
-- Ensure the rh_inscricoes table exists with proper structure
CREATE TABLE IF NOT EXISTS rh_inscricoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vaga_id UUID REFERENCES rh_vagas(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    nome_completo TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT,
    linkedin_url TEXT,
    curriculo_url TEXT,
    curriculo_nome TEXT,
    carta_apresentacao TEXT,
    experiencia_relevante TEXT,
    pretensao_salarial TEXT,
    disponibilidade_inicio TEXT,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'aprovado', 'rejeitado')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'rh_inscricoes' 
        AND policyname = 'Enable public insert for inscricoes'
    ) THEN
        -- Enable RLS
        ALTER TABLE rh_inscricoes ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Enable public insert for inscricoes"
        ON rh_inscricoes
        FOR INSERT
        WITH CHECK (true);

        CREATE POLICY "Enable read for company members"
        ON rh_inscricoes
        FOR SELECT
        USING (
          EXISTS (SELECT 1 FROM companies WHERE id = rh_inscricoes.company_id)
        );

        CREATE POLICY "Enable update for company members"
        ON rh_inscricoes
        FOR UPDATE
        USING (
          EXISTS (SELECT 1 FROM companies WHERE id = rh_inscricoes.company_id)
        )
        WITH CHECK (
          EXISTS (SELECT 1 FROM companies WHERE id = rh_inscricoes.company_id)
        );
    END IF;
END
$$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_rh_inscricoes_vaga_id ON rh_inscricoes(vaga_id);
CREATE INDEX IF NOT EXISTS idx_rh_inscricoes_company_id ON rh_inscricoes(company_id);
CREATE INDEX IF NOT EXISTS idx_rh_inscricoes_status ON rh_inscricoes(status);
CREATE INDEX IF NOT EXISTS idx_rh_inscricoes_email ON rh_inscricoes(email);
