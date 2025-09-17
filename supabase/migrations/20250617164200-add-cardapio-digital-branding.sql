-- Migração para adicionar configurações de marca do cardápio digital
-- Data: 2025-06-17
-- Descrição: Tabelas para armazenar logos, banners, cores e configurações de estilo do cardápio digital

-- 1. Tabela para armazenar arquivos de mídia (logos, banners, etc.)
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    CONSTRAINT unique_company_file_type UNIQUE(company_id, file_type, is_active)
);

-- 2. Tabela para configurações de marca do cardápio digital
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

-- 3. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Triggers para atualizar updated_at
CREATE TRIGGER update_media_files_updated_at 
    BEFORE UPDATE ON media_files 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cardapio_branding_updated_at 
    BEFORE UPDATE ON cardapio_branding 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_media_files_company_id ON media_files(company_id);
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_files_is_active ON media_files(is_active);

CREATE INDEX IF NOT EXISTS idx_cardapio_branding_company_id ON cardapio_branding(company_id);
CREATE INDEX IF NOT EXISTS idx_cardapio_branding_is_active ON cardapio_branding(is_active);

-- 6. Políticas RLS (Row Level Security)
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

-- 7. Inserir configurações padrão para empresas existentes
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

-- 8. Comentários para documentação
COMMENT ON TABLE media_files IS 'Armazena arquivos de mídia (logos, banners, imagens de produtos) das empresas';
COMMENT ON TABLE cardapio_branding IS 'Configurações de marca e estilo para o cardápio digital de cada empresa';

COMMENT ON COLUMN media_files.file_type IS 'Tipo do arquivo: logo, banner, product_image, etc.';
COMMENT ON COLUMN media_files.file_url IS 'URL do arquivo no storage (Supabase Storage)';
COMMENT ON COLUMN media_files.file_size IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN media_files.mime_type IS 'Tipo MIME do arquivo (image/jpeg, image/png, etc.)';

COMMENT ON COLUMN cardapio_branding.primary_color IS 'Cor primária da marca em formato hexadecimal';
COMMENT ON COLUMN cardapio_branding.secondary_color IS 'Cor secundária da marca em formato hexadecimal';
COMMENT ON COLUMN cardapio_branding.accent_color IS 'Cor de destaque para preços e CTAs em formato hexadecimal';
COMMENT ON COLUMN cardapio_branding.header_style IS 'Estilo do cabeçalho: modern, classic ou minimal';
COMMENT ON COLUMN cardapio_branding.additional_settings IS 'Configurações adicionais em formato JSON para flexibilidade futura';
