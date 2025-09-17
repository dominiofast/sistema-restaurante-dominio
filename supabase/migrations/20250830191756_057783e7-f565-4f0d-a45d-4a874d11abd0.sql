-- Criar uma função específica para delete de endereços no cardápio público
-- que funciona melhor com usuários anônimos
CREATE OR REPLACE FUNCTION delete_customer_address_public(
  p_address_id UUID,
  p_company_id UUID,
  p_customer_phone TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se a empresa está ativa
  IF NOT EXISTS (
    SELECT 1 FROM companies 
    WHERE id = p_company_id AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Company not found or inactive';
  END IF;
  
  -- Verificar se o endereço existe e pertence ao telefone informado
  IF NOT EXISTS (
    SELECT 1 FROM customer_addresses 
    WHERE id = p_address_id 
    AND company_id = p_company_id 
    AND customer_phone = p_customer_phone
  ) THEN
    RAISE EXCEPTION 'Address not found or does not belong to this customer';
  END IF;
  
  -- Deletar o endereço
  DELETE FROM customer_addresses 
  WHERE id = p_address_id 
  AND company_id = p_company_id 
  AND customer_phone = p_customer_phone;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error deleting address: %', SQLERRM;
END;
$$;

-- Permitir que usuários anônimos executem esta função
GRANT EXECUTE ON FUNCTION delete_customer_address_public TO anon;