-- Configurar tipos MIME permitidos para arquivos executáveis
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'application/octet-stream',
  'application/x-msdownload', 
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-winexe',
  'application/vnd.microsoft.portable-executable',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-apple-diskimage',
  'application/x-debian-package'
]::text[]
WHERE name = 'programas';

-- Aumentar ainda mais o limite (200MB) para garantir
UPDATE storage.buckets 
SET file_size_limit = 209715200 
WHERE name = 'programas';