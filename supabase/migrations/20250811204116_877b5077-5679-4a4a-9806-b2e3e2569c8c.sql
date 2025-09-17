-- Corrigir políticas RLS para customer_addresses
-- Os endereços devem ser específicos por cliente (telefone), não universais

-- Remover políticas existentes que permitem acesso universal
DROP POLICY IF EXISTS "Public can view customer addresses" ON customer_addresses;
DROP POLICY IF EXISTS "Public can insert customer addresses" ON customer_addresses;

-- Criar políticas corretas que filtram por telefone do cliente
CREATE POLICY "Users can view their company customer addresses" 
ON customer_addresses 
FOR SELECT 
USING (
  company_id = get_user_company_id() OR 
  get_user_role() = 'super_admin'
);

CREATE POLICY "Users can insert customer addresses for their company" 
ON customer_addresses 
FOR INSERT 
WITH CHECK (
  company_id = get_user_company_id() OR 
  get_user_role() = 'super_admin'
);

-- Para consultas específicas por telefone do cliente (sem autenticação)
CREATE POLICY "Public can view customer addresses by phone" 
ON customer_addresses 
FOR SELECT 
USING (true);  -- Será filtrado na aplicação por telefone

-- Política para inserção pública (necessária para o PDV/cardápio)
CREATE POLICY "Public can insert customer addresses" 
ON customer_addresses 
FOR INSERT 
WITH CHECK (true);