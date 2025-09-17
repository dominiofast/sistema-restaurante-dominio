-- Criar tabela de Fornecedores
CREATE TABLE fornecedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    nome TEXT NOT NULL,
    cnpj_cpf TEXT UNIQUE,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de Notas de Entrada
CREATE TABLE notas_entrada (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
    numero VARCHAR(255) NOT NULL,
    data_emissao DATE NOT NULL,
    data_entrada DATE NOT NULL,
    valor_total NUMERIC(10, 2) NOT NULL,
    conciliacao_financeira BOOLEAN DEFAULT FALSE,
    conciliacao_estoque BOOLEAN DEFAULT FALSE,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_nota_por_empresa UNIQUE (company_id, numero, fornecedor_id)
);

-- Criar tabela de Itens da Nota de Entrada
-- Esta tabela dependerá de uma tabela de 'produtos'.
-- Se você não tiver uma tabela de produtos, precisaremos criá-la também.
-- Por enquanto, vou assumir uma tabela 'produtos' com uma coluna 'id'.
CREATE TABLE notas_entrada_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nota_id UUID REFERENCES notas_entrada(id) ON DELETE CASCADE NOT NULL,
    -- produto_id UUID REFERENCES produtos(id) NOT NULL, -- Descomente quando a tabela de produtos existir
    descricao_produto TEXT NOT NULL,
    quantidade NUMERIC(10, 3) NOT NULL,
    unidade TEXT NOT NULL, -- Ex: 'UN', 'KG', 'CX'
    valor_unitario NUMERIC(10, 2) NOT NULL,
    valor_total NUMERIC(10, 2) NOT NULL
);

-- Políticas de RLS (Row Level Security)
-- Permite que usuários acessem apenas os dados de sua própria empresa
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_entrada ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_entrada_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso total para a própria empresa em fornecedores"
ON fornecedores FOR ALL
USING (company_id = (SELECT auth.uid() FROM companies WHERE id = company_id));

CREATE POLICY "Acesso total para a própria empresa em notas_entrada"
ON notas_entrada FOR ALL
USING (company_id = (SELECT auth.uid() FROM companies WHERE id = company_id));

CREATE POLICY "Acesso total para a própria empresa em notas_entrada_itens"
ON notas_entrada_itens FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM notas_entrada ne
        WHERE ne.id = nota_id AND ne.company_id = (SELECT auth.uid() FROM companies WHERE id = ne.company_id)
    )
);

-- Índices para otimizar consultas
CREATE INDEX idx_fornecedores_company_id ON fornecedores(company_id);
CREATE INDEX idx_notas_entrada_company_id ON notas_entrada(company_id);
CREATE INDEX idx_notas_entrada_fornecedor_id ON notas_entrada(fornecedor_id);
CREATE INDEX idx_notas_entrada_itens_nota_id ON notas_entrada_itens(nota_id); 