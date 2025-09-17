-- Criar funções RPC para gerenciar programas
CREATE OR REPLACE FUNCTION get_programas_saipos()
RETURNS SETOF programas_saipos
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM programas_saipos ORDER BY nome;
$$;

CREATE OR REPLACE FUNCTION insert_programa_saipos(programa_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO programas_saipos (nome, descricao, url_download, versao, icone, ativo)
  VALUES (
    programa_data->>'nome',
    programa_data->>'descricao',
    programa_data->>'url_download', 
    programa_data->>'versao',
    programa_data->>'icone',
    (programa_data->>'ativo')::boolean
  );
END;
$$;

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
    updated_at = now()
  WHERE id = programa_id;
END;
$$;