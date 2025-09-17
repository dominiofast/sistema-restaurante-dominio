-- Limpar arquivos antigos da Domínio Pizzas e recriar
DELETE FROM media_files WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Inserir novos arquivos de mídia para Domínio Pizzas
INSERT INTO media_files (company_id, file_name, file_type, file_url, file_size, mime_type, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'dominio-pizzas-logo.png', 'logo', '/src/assets/dominio-pizzas-logo.png', 50000, 'image/png', true),
('550e8400-e29b-41d4-a716-446655440001', 'dominio-pizzas-banner.png', 'banner', '/src/assets/dominio-pizzas-banner.png', 100000, 'image/png', true);

-- Inserir novos arquivos de mídia para 300 Graus
INSERT INTO media_files (company_id, file_name, file_type, file_url, file_size, mime_type, is_active) VALUES
('a9837084-d798-4b35-9344-0fdad7e4203a', '300-graus-logo.png', 'logo', '/src/assets/300-graus-logo.png', 50000, 'image/png', true),
('a9837084-d798-4b35-9344-0fdad7e4203a', '300-graus-banner.png', 'banner', '/src/assets/300-graus-banner.png', 100000, 'image/png', true);

-- Atualizar configurações de branding da Domínio Pizzas
UPDATE cardapio_branding 
SET 
  logo_file_id = (SELECT id FROM media_files WHERE company_id = '550e8400-e29b-41d4-a716-446655440001' AND file_type = 'logo' LIMIT 1),
  banner_file_id = (SELECT id FROM media_files WHERE company_id = '550e8400-e29b-41d4-a716-446655440001' AND file_type = 'banner' LIMIT 1)
WHERE company_id = '550e8400-e29b-41d4-a716-446655440001';

-- Atualizar configurações de branding da 300 Graus
UPDATE cardapio_branding 
SET 
  logo_file_id = (SELECT id FROM media_files WHERE company_id = 'a9837084-d798-4b35-9344-0fdad7e4203a' AND file_type = 'logo' LIMIT 1),
  banner_file_id = (SELECT id FROM media_files WHERE company_id = 'a9837084-d798-4b35-9344-0fdad7e4203a' AND file_type = 'banner' LIMIT 1)
WHERE company_id = 'a9837084-d798-4b35-9344-0fdad7e4203a';

-- Verificar as atualizações
SELECT 
  c.name,
  cb.show_logo,
  cb.show_banner,
  mf_logo.file_name as logo_file,
  mf_banner.file_name as banner_file
FROM companies c
JOIN cardapio_branding cb ON c.id = cb.company_id
LEFT JOIN media_files mf_logo ON cb.logo_file_id = mf_logo.id
LEFT JOIN media_files mf_banner ON cb.banner_file_id = mf_banner.id
WHERE c.name IN ('Domínio Pizzas', '300 Graus Pizzas - Delivery');