-- Adicionar campo para a imagem do banner na configuração existente
ALTER TABLE public.rh_vagas_config ADD COLUMN banner_url TEXT;

-- Remover a política de segurança antiga e incorreta
DROP POLICY IF EXISTS "Enable all actions for users based on company_id" ON public.rh_vagas_config;

-- Criar a nova política de segurança correta
-- Ela permite que usuários gerenciem a config se pertencerem à empresa OU se forem super admins.
CREATE POLICY "Enable all actions for company members or super admins"
ON public.rh_vagas_config
FOR ALL
USING (
  (EXISTS (SELECT 1 FROM company_users WHERE company_id = rh_vagas_config.company_id AND user_id = auth.uid()))
  OR
  (SELECT get_my_claim('role') ->> 0 = '"super_admin"')
)
WITH CHECK (
  (EXISTS (SELECT 1 FROM company_users WHERE company_id = rh_vagas_config.company_id AND user_id = auth.uid()))
  OR
  (SELECT get_my_claim('role') ->> 0 = '"super_admin"')
);


-- Criar a tabela para armazenar as vagas de emprego
CREATE TABLE rh_vagas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID REFERENCES rh_vagas_config(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT, -- Ex: "São Paulo, SP" ou "Remoto"
    type TEXT, -- Ex: "Tempo Integral", "Meio Período", "Contrato"
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    apply_url TEXT, -- Link externo para candidatura, se houver
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS para a nova tabela de vagas
ALTER TABLE public.rh_vagas ENABLE ROW LEVEL SECURITY;

-- Criar política de segurança para a tabela de vagas
CREATE POLICY "Enable all actions on vagas for company members or super admins"
ON public.rh_vagas
FOR ALL
USING (
  (EXISTS (SELECT 1 FROM company_users WHERE company_id = rh_vagas.company_id AND user_id = auth.uid()))
  OR
  (SELECT get_my_claim('role') ->> 0 = '"super_admin"')
)
WITH CHECK (
  (EXISTS (SELECT 1 FROM company_users WHERE company_id = rh_vagas.company_id AND user_id = auth.uid()))
  OR
  (SELECT get_my_claim('role') ->> 0 = '"super_admin"')
);

-- Adicionar índices para otimizar consultas
CREATE INDEX idx_rh_vagas_config_id ON rh_vagas(config_id);
CREATE INDEX idx_rh_vagas_company_id ON rh_vagas(company_id); 