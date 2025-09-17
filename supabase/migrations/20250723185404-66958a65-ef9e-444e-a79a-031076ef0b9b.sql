-- Criar bucket para arquivos dos programas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('programas', 'programas', true);

-- Criar políticas para o bucket programas
CREATE POLICY "Public can view programas files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'programas');

CREATE POLICY "Super admins can upload programas files"
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'programas' AND 
  (
    (auth.jwt() ->> 'role') = 'super_admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin' OR
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
  )
);

CREATE POLICY "Super admins can delete programas files"
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'programas' AND 
  (
    (auth.jwt() ->> 'role') = 'super_admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin' OR
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
  )
);

-- Limpar programas pré-carregados
DELETE FROM public.programas_saipos;

-- Adicionar coluna para o caminho do arquivo
ALTER TABLE public.programas_saipos 
ADD COLUMN arquivo_path text;