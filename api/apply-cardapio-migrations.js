// API para aplicar migrações do cardápio no Neon
import { Pool } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verificar se DATABASE_URL está configurada
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não configurada');
    return res.status(500).json({
      success: false,
      error: 'Erro de configuração do banco de dados'
    });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🚀 Aplicando migrações do cardápio no Neon...');

    // 1. Criar tabela de categorias
    console.log('📋 Criando tabela categorias...');
    await pool.query(`
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
    `);

    // 2. Atualizar tabela de produtos
    console.log('📋 Atualizando tabela produtos...');
    await pool.query(`
      ALTER TABLE public.produtos 
      DROP COLUMN IF EXISTS categoria,
      ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS preparation_time INTEGER,
      ADD COLUMN IF NOT EXISTS ingredients TEXT,
      ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
    `);

    // Remover restrição NOT NULL da coluna image se existir
    await pool.query(`
      ALTER TABLE public.produtos ALTER COLUMN image DROP NOT NULL;
    `);

    // 3. Criar tabela de categorias de adicionais
    console.log('📋 Criando tabela categorias_adicionais...');
    await pool.query(`
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
    `);

    // 4. Criar tabela de itens adicionais
    console.log('📋 Criando tabela adicionais...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.adicionais (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) DEFAULT 0.00,
        is_available BOOLEAN DEFAULT true,
        order_position INTEGER DEFAULT 0,
        categoria_adicional_id UUID NOT NULL REFERENCES categorias_adicionais(id) ON DELETE CASCADE,
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 5. Criar tabela de associação produto-categorias de adicionais
    console.log('📋 Criando tabela produto_categorias_adicionais...');
    await pool.query(`
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
    `);

    // 6. Criar tabela de branding do cardápio
    console.log('📋 Criando tabela cardapio_branding...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.cardapio_branding (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        logo_file_id TEXT,
        banner_file_id TEXT,
        show_logo BOOLEAN DEFAULT true,
        show_banner BOOLEAN DEFAULT false,
        primary_color TEXT DEFAULT '#3B82F6',
        secondary_color TEXT DEFAULT '#1E40AF',
        accent_color TEXT DEFAULT '#F59E0B',
        text_color TEXT DEFAULT '#1F2937',
        background_color TEXT DEFAULT '#FFFFFF',
        header_style TEXT CHECK (header_style IN ('modern', 'classic', 'minimal')) DEFAULT 'modern',
        logo_url TEXT,
        banner_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 7. Criar índices para performance
    console.log('📊 Criando índices...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_categorias_company_id ON categorias(company_id);
      CREATE INDEX IF NOT EXISTS idx_categorias_order ON categorias(order_position);
      CREATE INDEX IF NOT EXISTS idx_produtos_categoria_id ON produtos(categoria_id);
      CREATE INDEX IF NOT EXISTS idx_produtos_company_id ON produtos(company_id);
      CREATE INDEX IF NOT EXISTS idx_categorias_adicionais_company_id ON categorias_adicionais(company_id);
      CREATE INDEX IF NOT EXISTS idx_adicionais_categoria_id ON adicionais(categoria_adicional_id);
      CREATE INDEX IF NOT EXISTS idx_cardapio_branding_company_id ON cardapio_branding(company_id);
    `);

    // 8. Habilitar RLS para todas as tabelas
    console.log('🔒 Configurando RLS...');
    await pool.query(`
      ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
      ALTER TABLE categorias_adicionais ENABLE ROW LEVEL SECURITY;
      ALTER TABLE adicionais ENABLE ROW LEVEL SECURITY;
      ALTER TABLE produto_categorias_adicionais ENABLE ROW LEVEL SECURITY;
      ALTER TABLE cardapio_branding ENABLE ROW LEVEL SECURITY;
    `);

    // 9. Criar políticas RLS básicas
    console.log('🛡️ Criando políticas RLS...');
    await pool.query(`
      -- Políticas para categorias
      DROP POLICY IF EXISTS "Allow all operations on categorias" ON categorias;
      CREATE POLICY "Allow all operations on categorias" ON categorias FOR ALL USING (true) WITH CHECK (true);
      
      -- Políticas para categorias_adicionais
      DROP POLICY IF EXISTS "Allow all operations on categorias_adicionais" ON categorias_adicionais;
      CREATE POLICY "Allow all operations on categorias_adicionais" ON categorias_adicionais FOR ALL USING (true) WITH CHECK (true);
      
      -- Políticas para adicionais
      DROP POLICY IF EXISTS "Allow all operations on adicionais" ON adicionais;
      CREATE POLICY "Allow all operations on adicionais" ON adicionais FOR ALL USING (true) WITH CHECK (true);
      
      -- Políticas para produto_categorias_adicionais
      DROP POLICY IF EXISTS "Allow all operations on produto_categorias_adicionais" ON produto_categorias_adicionais;
      CREATE POLICY "Allow all operations on produto_categorias_adicionais" ON produto_categorias_adicionais FOR ALL USING (true) WITH CHECK (true);
      
      -- Políticas para cardapio_branding
      DROP POLICY IF EXISTS "Allow all operations on cardapio_branding" ON cardapio_branding;
      CREATE POLICY "Allow all operations on cardapio_branding" ON cardapio_branding FOR ALL USING (true) WITH CHECK (true);
    `);

    console.log('✅ Migrações do cardápio aplicadas com sucesso!');

    return res.status(200).json({
      success: true,
      message: 'Migrações do cardápio aplicadas com sucesso no Neon',
      tables: [
        'categorias',
        'produtos (atualizada)',
        'categorias_adicionais',
        'adicionais',
        'produto_categorias_adicionais',
        'cardapio_branding'
      ],
      features: [
        'Estrutura completa do cardápio',
        'Sistema de categorias',
        'Adicionais e opções extras',
        'Branding personalizado',
        'Índices de performance',
        'RLS configurado'
      ]
    });

  } catch (error) {
    console.error('💥 Erro ao aplicar migrações do cardápio:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  } finally {
    await pool.end();
  }
}

