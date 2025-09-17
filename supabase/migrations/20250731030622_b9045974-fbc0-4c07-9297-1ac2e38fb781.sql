-- Criar tabela para metadados de arquivos chunked
CREATE TABLE IF NOT EXISTS public.chunked_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  total_size BIGINT NOT NULL,
  total_chunks INTEGER NOT NULL,
  chunk_paths TEXT[] NOT NULL,
  mime_type TEXT,
  upload_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chunked_files ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on chunked_files" 
ON public.chunked_files 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_chunked_files_updated_at
BEFORE UPDATE ON public.chunked_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();