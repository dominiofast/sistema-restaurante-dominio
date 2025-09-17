-- Remover funções existentes
DROP FUNCTION IF EXISTS get_programas_saipos();
DROP FUNCTION IF EXISTS insert_programa_saipos(JSONB);
DROP FUNCTION IF EXISTS update_programa_saipos(UUID, JSONB);
DROP FUNCTION IF EXISTS delete_programa_saipos(UUID);

-- Função para buscar programas
CREATE OR REPLACE FUNCTION get_programas_saipos()
RETURNS TABLE(
  id UUID,
  nome TEXT,
  descricao TEXT,
  url_download TEXT,
  versao TEXT,
  icone TEXT,
  ativo BOOLEAN,
  arquivo_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.nome,
    p.descricao,
    p.url_download,
    p.versao,
    p.icone,
    p.ativo,
    p.arquivo_path,
    p.created_at
  FROM public.programas_saipos p
  ORDER BY p.created_at DESC;
$$;

-- Função para inserir programa
CREATE OR REPLACE FUNCTION insert_programa_saipos(programa_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.programas_saipos (
    nome,
    descricao,
    url_download,
    versao,
    icone,
    ativo,
    arquivo_path
  ) VALUES (
    programa_data->>'nome',
    programa_data->>'descricao',
    programa_data->>'url_download',
    programa_data->>'versao',
    programa_data->>'icone',
    COALESCE((programa_data->>'ativo')::boolean, true),
    programa_data->>'arquivo_path'
  ) RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Função para atualizar programa
CREATE OR REPLACE FUNCTION update_programa_saipos(programa_id UUID, programa_data JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.programas_saipos 
  SET 
    nome = programa_data->>'nome',
    descricao = programa_data->>'descricao',
    url_download = programa_data->>'url_download',
    versao = programa_data->>'versao',
    icone = programa_data->>'icone',
    ativo = COALESCE((programa_data->>'ativo')::boolean, ativo),
    arquivo_path = COALESCE(programa_data->>'arquivo_path', arquivo_path),
    updated_at = now()
  WHERE id = programa_id;
END;
$$;

-- Função para deletar programa
CREATE OR REPLACE FUNCTION delete_programa_saipos(programa_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.programas_saipos WHERE id = programa_id;
END;
$$;