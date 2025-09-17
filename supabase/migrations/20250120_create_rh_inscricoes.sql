-- Criar tabela para armazenar inscrições nas vagas
CREATE TABLE rh_inscricoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vaga_id UUID REFERENCES rh_vagas(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    nome_completo TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT,
    linkedin_url TEXT,
    curriculo_url TEXT,
    carta_apresentacao TEXT,
    experiencia_relevante TEXT,
    pretensao_salarial TEXT,
    disponibilidade_inicio TEXT,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'aprovado', 'rejeitado')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE rh_inscricoes ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção pública (qualquer pessoa pode se inscrever)
CREATE POLICY "Enable public insert for inscricoes"
ON rh_inscricoes
FOR INSERT
WITH CHECK (true);

-- Política para permitir que empresas vejam suas próprias inscrições
CREATE POLICY "Enable read for company members"
ON rh_inscricoes
FOR SELECT
USING (
  (EXISTS (SELECT 1 FROM company_users WHERE company_id = rh_inscricoes.company_id AND user_id = auth.uid()))
  OR
  (SELECT get_my_claim('role') ->> 0 = '"super_admin"')
);

-- Política para permitir que empresas atualizem status das inscrições
CREATE POLICY "Enable update for company members"
ON rh_inscricoes
FOR UPDATE
USING (
  (EXISTS (SELECT 1 FROM company_users WHERE company_id = rh_inscricoes.company_id AND user_id = auth.uid()))
  OR
  (SELECT get_my_claim('role') ->> 0 = '"super_admin"')
)
WITH CHECK (
  (EXISTS (SELECT 1 FROM company_users WHERE company_id = rh_inscricoes.company_id AND user_id = auth.uid()))
  OR
  (SELECT get_my_claim('role') ->> 0 = '"super_admin"')
);

-- Adicionar índices para otimizar consultas
CREATE INDEX idx_rh_inscricoes_vaga_id ON rh_inscricoes(vaga_id);
CREATE INDEX idx_rh_inscricoes_company_id ON rh_inscricoes(company_id);
CREATE INDEX idx_rh_inscricoes_status ON rh_inscricoes(status);
CREATE INDEX idx_rh_inscricoes_email ON rh_inscricoes(email); 