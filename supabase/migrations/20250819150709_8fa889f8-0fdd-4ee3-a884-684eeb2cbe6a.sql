-- Criar função para verificar status do trigger e RLS
CREATE OR REPLACE FUNCTION get_trigger_and_rls_status()
RETURNS TABLE(trigger boolean, rls boolean) 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se existe trigger WhatsApp ativo na tabela pedido_itens
  -- e verificar se RLS está habilitado
  RETURN QUERY
  SELECT 
    EXISTS(
      SELECT 1 FROM pg_trigger t 
      JOIN pg_class c ON c.oid = t.tgrelid 
      WHERE c.relname = 'pedido_itens' 
      AND t.tgname LIKE '%whatsapp%'
      AND t.tgenabled = 'O'  -- 'O' = enabled, 'D' = disabled
    ) as trigger,
    EXISTS(
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'pedido_itens' 
      AND rowsecurity = true
    ) as rls;
END;
$$;