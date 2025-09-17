
-- Criar tabela de categorias de produtos
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  order_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Atualizar tabela de produtos para usar categoria_id
ALTER TABLE public.produtos 
DROP COLUMN IF EXISTS categoria,
ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS preparation_time INTEGER,
ADD COLUMN IF NOT EXISTS ingredients TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Remover restrição NOT NULL da coluna image se existir
ALTER TABLE public.produtos ALTER COLUMN image DROP NOT NULL;

-- Criar tabela de categorias de adicionais
CREATE TABLE IF NOT EXISTS public.categorias_adicionais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  selection_type TEXT CHECK (selection_type IN ('single', 'multiple', 'quantity')) DEFAULT 'single',
  is_required BOOLEAN DEFAULT false,
  min_selection INTEGER DEFAULT 0,
  max_selection INTEGER,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de itens adicionais
CREATE TABLE IF NOT EXISTS public.adicionais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image TEXT,
  categoria_adicional_id UUID NOT NULL REFERENCES categorias_adicionais(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de associação produto-categorias de adicionais
CREATE TABLE IF NOT EXISTS public.produto_categorias_adicionais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  categoria_adicional_id UUID NOT NULL REFERENCES categorias_adicionais(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,
  min_selection INTEGER DEFAULT 0,
  max_selection INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(produto_id, categoria_adicional_id)
);

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_categorias_company_id ON categorias(company_id);
CREATE INDEX IF NOT EXISTS idx_categorias_order ON categorias(order_position);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria_id ON produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_company_id ON produtos(company_id);
CREATE INDEX IF NOT EXISTS idx_categorias_adicionais_company_id ON categorias_adicionais(company_id);
CREATE INDEX IF NOT EXISTS idx_adicionais_categoria_id ON adicionais(categoria_adicional_id);

-- Habilitar RLS para todas as tabelas
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_adicionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE adicionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto_categorias_adicionais ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir tudo por enquanto, pode ser refinado depois)
CREATE POLICY "Allow all operations on categorias" ON categorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on categorias_adicionais" ON categorias_adicionais FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on adicionais" ON adicionais FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on produto_categorias_adicionais" ON produto_categorias_adicionais FOR ALL USING (true) WITH CHECK (true);
