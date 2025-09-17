
-- Criar bucket de storage para arquivos de mídia
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true);

-- Política para permitir upload de arquivos
CREATE POLICY "Allow authenticated users to upload media files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Política para permitir visualização pública dos arquivos
CREATE POLICY "Allow public access to media files" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Política para permitir usuários autenticados atualizarem seus arquivos
CREATE POLICY "Allow authenticated users to update media files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Política para permitir usuários autenticados deletarem seus arquivos
CREATE POLICY "Allow authenticated users to delete media files" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Adicionar coluna slug à tabela companies se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'companies' AND column_name = 'slug') THEN
        ALTER TABLE companies ADD COLUMN slug VARCHAR(255) UNIQUE;
        
        -- Gerar slugs para empresas existentes baseado no nome
        UPDATE companies 
        SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
        WHERE slug IS NULL;
    END IF;
END $$;

-- Tabela para armazenar arquivos de mídia (logos, banners, etc.)
CREATE TABLE IF NOT EXISTS media_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'logo', 'banner', 'product_image', etc.
    file_url TEXT NOT NULL,
    file_size INTEGER, -- tamanho em bytes
    mime_type VARCHAR(100), -- image/jpeg, image/png, etc.
    alt_text VARCHAR(255), -- texto alternativo para acessibilidade
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para configurações de marca do cardápio digital
CREATE TABLE IF NOT EXISTS cardapio_branding (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Referências para arquivos de mídia
    logo_file_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
    banner_file_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
    
    -- Configurações de exibição
    show_logo BOOLEAN DEFAULT true,
    show_banner BOOLEAN DEFAULT true,
    
    -- Paleta de cores (formato hexadecimal)
    primary_color VARCHAR(7) DEFAULT '#3B82F6', -- Cor primária
    secondary_color VARCHAR(7) DEFAULT '#1E40AF', -- Cor secundária
    accent_color VARCHAR(7) DEFAULT '#F59E0B', -- Cor de destaque
    text_color VARCHAR(7) DEFAULT '#1F2937', -- Cor do texto
    background_color VARCHAR(7) DEFAULT '#FFFFFF', -- Cor de fundo
    
    -- Estilo do cabeçalho
    header_style VARCHAR(20) DEFAULT 'modern' CHECK (header_style IN ('modern', 'classic', 'minimal')),
    
    -- Configurações adicionais (JSON para flexibilidade futura)
    additional_settings JSONB DEFAULT '{}',
    
    -- Metadados
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir apenas uma configuração ativa por empresa
    CONSTRAINT unique_active_branding_per_company UNIQUE(company_id, is_active)
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_media_files_updated_at 
    BEFORE UPDATE ON media_files 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cardapio_branding_updated_at 
    BEFORE UPDATE ON cardapio_branding 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_media_files_company_id ON media_files(company_id);
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_files_is_active ON media_files(is_active);

CREATE INDEX IF NOT EXISTS idx_cardapio_branding_company_id ON cardapio_branding(company_id);
CREATE INDEX IF NOT EXISTS idx_cardapio_branding_is_active ON cardapio_branding(is_active);

-- Políticas RLS (Row Level Security)
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE cardapio_branding ENABLE ROW LEVEL SECURITY;

-- Política para media_files: usuários podem ver/editar apenas arquivos de suas empresas
CREATE POLICY "Users can view media files of their company" ON media_files
    FOR SELECT USING (
        company_id IN (
            SELECT id FROM companies 
            WHERE id = company_id
        )
    );

CREATE POLICY "Users can insert media files for their company" ON media_files
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT id FROM companies 
            WHERE id = company_id
        )
    );

CREATE POLICY "Users can update media files of their company" ON media_files
    FOR UPDATE USING (
        company_id IN (
            SELECT id FROM companies 
            WHERE id = company_id
        )
    );

CREATE POLICY "Users can delete media files of their company" ON media_files
    FOR DELETE USING (
        company_id IN (
            SELECT id FROM companies 
            WHERE id = company_id
        )
    );

-- Política para cardapio_branding: usuários podem ver/editar apenas configurações de suas empresas
CREATE POLICY "Users can view branding of their company" ON cardapio_branding
    FOR SELECT USING (
        company_id IN (
            SELECT id FROM companies 
            WHERE id = company_id
        )
    );

CREATE POLICY "Users can insert branding for their company" ON cardapio_branding
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT id FROM companies 
            WHERE id = company_id
        )
    );

CREATE POLICY "Users can update branding of their company" ON cardapio_branding
    FOR UPDATE USING (
        company_id IN (
            SELECT id FROM companies 
            WHERE id = company_id
        )
    );

-- Inserir configurações padrão para empresas existentes
INSERT INTO cardapio_branding (company_id, primary_color, secondary_color, accent_color, text_color, background_color, header_style)
SELECT 
    id,
    '#3B82F6', -- primary_color
    '#1E40AF', -- secondary_color  
    '#F59E0B', -- accent_color
    '#1F2937', -- text_color
    '#FFFFFF', -- background_color
    'modern'   -- header_style
FROM companies 
WHERE id NOT IN (SELECT company_id FROM cardapio_branding WHERE is_active = true)
ON CONFLICT (company_id, is_active) DO NOTHING;
