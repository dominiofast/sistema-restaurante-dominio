-- Política RLS temporária mais simples para debug
-- Permitir acesso completo para usuários autenticados temporariamente

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view their company customer addresses" ON customer_addresses;
DROP POLICY IF EXISTS "Users can insert their company customer addresses" ON customer_addresses;
DROP POLICY IF EXISTS "Users can update their company customer addresses" ON customer_addresses;
DROP POLICY IF EXISTS "Users can delete their company customer addresses" ON customer_addresses;

-- Criar políticas temporárias simples
CREATE POLICY "Authenticated users can view customer addresses"
ON customer_addresses
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert customer addresses"
ON customer_addresses
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update customer addresses"
ON customer_addresses
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete customer addresses"
ON customer_addresses
FOR DELETE
TO authenticated
USING (true);