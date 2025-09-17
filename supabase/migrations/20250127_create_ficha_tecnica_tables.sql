-- Criação das tabelas para Ficha Técnica
-- Data: 2025-01-27

-- Tabela para Mercadorias/Ingredientes
CREATE TABLE IF NOT EXISTS mercadorias_ingredientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    unidade_medida VARCHAR(50) NOT NULL, -- kg, g, L, ml, unidade, etc
    categoria VARCHAR(100), -- carnes, temperos, massas, etc
    preco_unitario DECIMAL(10,2),
    estoque_atual DECIMAL(10,3) DEFAULT 0,
    estoque_minimo DECIMAL(10,3) DEFAULT 0,
    fornecedor VARCHAR(255),
    codigo_produto VARCHAR(100),
    observacoes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Tabela para Receitas/Fichas Técnicas
CREATE TABLE IF NOT EXISTS receitas_fichas_tecnicas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100), -- pizzas, massas, molhos, etc
    tempo_preparo INTEGER, -- em minutos
    rendimento DECIMAL(10,2), -- quantas porções rende
    unidade_rendimento VARCHAR(50), -- unidades, kg, L, etc
    modo_preparo TEXT,
    observacoes TEXT,
    custo_total DECIMAL(10,2), -- será calculado automaticamente
    preco_venda_sugerido DECIMAL(10,2),
    margem_lucro DECIMAL(5,2), -- percentual
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Tabela para Ingredientes das Receitas (Many-to-Many)
CREATE TABLE IF NOT EXISTS receitas_ingredientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    receita_id UUID NOT NULL REFERENCES receitas_fichas_tecnicas(id) ON DELETE CASCADE,
    mercadoria_id UUID NOT NULL REFERENCES mercadorias_ingredientes(id) ON DELETE CASCADE,
    quantidade DECIMAL(10,3) NOT NULL,
    unidade_medida VARCHAR(50) NOT NULL,
    custo_unitario DECIMAL(10,2), -- preço no momento da criação da receita
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(receita_id, mercadoria_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_mercadorias_company_id ON mercadorias_ingredientes(company_id);
CREATE INDEX IF NOT EXISTS idx_mercadorias_categoria ON mercadorias_ingredientes(categoria);
CREATE INDEX IF NOT EXISTS idx_mercadorias_is_active ON mercadorias_ingredientes(is_active);

CREATE INDEX IF NOT EXISTS idx_receitas_company_id ON receitas_fichas_tecnicas(company_id);
CREATE INDEX IF NOT EXISTS idx_receitas_categoria ON receitas_fichas_tecnicas(categoria);
CREATE INDEX IF NOT EXISTS idx_receitas_is_active ON receitas_fichas_tecnicas(is_active);

CREATE INDEX IF NOT EXISTS idx_receitas_ingredientes_receita ON receitas_ingredientes(receita_id);
CREATE INDEX IF NOT EXISTS idx_receitas_ingredientes_mercadoria ON receitas_ingredientes(mercadoria_id);

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mercadorias_updated_at 
    BEFORE UPDATE ON mercadorias_ingredientes
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receitas_updated_at 
    BEFORE UPDATE ON receitas_fichas_tecnicas
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receitas_ingredientes_updated_at 
    BEFORE UPDATE ON receitas_ingredientes
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para recalcular custo total da receita
CREATE OR REPLACE FUNCTION recalcular_custo_receita(receita_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    custo_total DECIMAL(10,2) := 0;
BEGIN
    SELECT COALESCE(SUM(ri.quantidade * ri.custo_unitario), 0)
    INTO custo_total
    FROM receitas_ingredientes ri
    WHERE ri.receita_id = receita_uuid;
    
    UPDATE receitas_fichas_tecnicas 
    SET custo_total = custo_total,
        updated_at = NOW()
    WHERE id = receita_uuid;
    
    RETURN custo_total;
END;
$$ language 'plpgsql';

-- Trigger para recalcular custo automaticamente quando ingredientes são alterados
CREATE OR REPLACE FUNCTION trigger_recalcular_custo()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalcular custo para a receita afetada
    IF TG_OP = 'DELETE' THEN
        PERFORM recalcular_custo_receita(OLD.receita_id);
        RETURN OLD;
    ELSE
        PERFORM recalcular_custo_receita(NEW.receita_id);
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_receitas_ingredientes_custo
    AFTER INSERT OR UPDATE OR DELETE ON receitas_ingredientes
    FOR EACH ROW 
    EXECUTE FUNCTION trigger_recalcular_custo();

-- Políticas RLS (Row Level Security)
ALTER TABLE mercadorias_ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE receitas_fichas_tecnicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE receitas_ingredientes ENABLE ROW LEVEL SECURITY;

-- Políticas simplificadas para mercadorias_ingredientes
CREATE POLICY "Enable all for authenticated users - mercadorias" 
ON mercadorias_ingredientes 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Políticas simplificadas para receitas_fichas_tecnicas
CREATE POLICY "Enable all for authenticated users - receitas" 
ON receitas_fichas_tecnicas 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Políticas simplificadas para receitas_ingredientes
CREATE POLICY "Enable all for authenticated users - receitas_ingredientes" 
ON receitas_ingredientes 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Comentários nas tabelas
COMMENT ON TABLE mercadorias_ingredientes IS 'Tabela para armazenar mercadorias e ingredientes utilizados nas receitas';
COMMENT ON TABLE receitas_fichas_tecnicas IS 'Tabela para armazenar receitas e fichas técnicas dos produtos';
COMMENT ON TABLE receitas_ingredientes IS 'Tabela de relacionamento entre receitas e ingredientes com quantidades';

-- Inserir dados de exemplo (opcional)
-- INSERT INTO mercadorias_ingredientes (company_id, nome, descricao, unidade_medida, categoria, preco_unitario, estoque_atual, estoque_minimo)
-- VALUES 
-- ((SELECT id FROM companies LIMIT 1), 'Farinha de Trigo', 'Farinha de trigo especial para pizza', 'kg', 'Massas', 3.50, 50.0, 10.0),
-- ((SELECT id FROM companies LIMIT 1), 'Molho de Tomate', 'Molho de tomate artesanal', 'kg', 'Molhos', 8.00, 20.0, 5.0),
-- ((SELECT id FROM companies LIMIT 1), 'Mussarela', 'Queijo mussarela fatiado', 'kg', 'Laticínios', 25.00, 15.0, 3.0); 