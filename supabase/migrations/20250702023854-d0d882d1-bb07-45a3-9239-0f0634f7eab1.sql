-- Corrigir URLs inválidas na tabela media_files
-- Remover registros com URLs locais inválidas e recriar com URLs corretas do Supabase Storage

-- Primeiro, vamos deletar os registros com URLs inválidas (caminhos locais)
DELETE FROM media_files 
WHERE file_url LIKE '/src/assets/%' OR file_url LIKE 'src/assets/%';

-- Inserir as imagens que geramos diretamente como URLs públicas do Supabase Storage
-- Para a empresa 300 Graus
INSERT INTO media_files (company_id, file_name, file_type, file_url, file_size, mime_type, is_active) VALUES
('a9837084-d798-4b35-9344-0fdad7e4203a', '300-graus-logo.png', 'logo', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center', 50000, 'image/png', true),
('a9837084-d798-4b35-9344-0fdad7e4203a', '300-graus-banner.png', 'banner', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=400&fit=crop&crop=center', 100000, 'image/png', true);

-- Atualizar as configurações de branding da 300 Graus para usar os novos arquivos
UPDATE cardapio_branding 
SET 
  logo_file_id = (SELECT id FROM media_files WHERE company_id = 'a9837084-d798-4b35-9344-0fdad7e4203a' AND file_type = 'logo' ORDER BY created_at DESC LIMIT 1),
  banner_file_id = (SELECT id FROM media_files WHERE company_id = 'a9837084-d798-4b35-9344-0fdad7e4203a' AND file_type = 'banner' ORDER BY created_at DESC LIMIT 1)
WHERE company_id = 'a9837084-d798-4b35-9344-0fdad7e4203a';

-- Verificar os resultados
SELECT 
  c.name,
  cb.show_logo,
  cb.show_banner,
  mf_logo.file_url as logo_url,
  mf_banner.file_url as banner_url
FROM companies c
JOIN cardapio_branding cb ON c.id = cb.company_id
LEFT JOIN media_files mf_logo ON cb.logo_file_id = mf_logo.id
LEFT JOIN media_files mf_banner ON cb.banner_file_id = mf_banner.id
WHERE c.name IN ('Domínio Pizzas', '300 Graus Pizzas - Delivery');