-- Criar função para deletar programa
CREATE OR REPLACE FUNCTION delete_programa_saipos(programa_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM programas_saipos WHERE id = programa_id;
END;
$$;