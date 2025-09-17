-- Atualizar função para inserir programas com arquivo
CREATE OR REPLACE FUNCTION insert_programa_saipos(programa_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO programas_saipos (nome, descricao, url_download, versao, icone, ativo, arquivo_path)
  VALUES (
    programa_data->>'nome',
    programa_data->>'descricao',
    programa_data->>'url_download', 
    programa_data->>'versao',
    programa_data->>'icone',
    (programa_data->>'ativo')::boolean,
    programa_data->>'arquivo_path'
  );
END;
$$;

-- Atualizar função para editar programas com arquivo
CREATE OR REPLACE FUNCTION update_programa_saipos(programa_id uuid, programa_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE programas_saipos 
  SET 
    nome = programa_data->>'nome',
    descricao = programa_data->>'descricao',
    url_download = programa_data->>'url_download',
    versao = programa_data->>'versao',
    icone = programa_data->>'icone',
    ativo = (programa_data->>'ativo')::boolean,
    arquivo_path = programa_data->>'arquivo_path',
    updated_at = now()
  WHERE id = programa_id;
END;
$$;