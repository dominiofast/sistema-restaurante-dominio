-- Corrigir as políticas RLS para a tabela company_settings
-- Primeiro, vamos deletar as políticas existentes que estão muito restritivas
DROP POLICY IF EXISTS "Users can view their company settings" ON company_settings;
DROP POLICY IF EXISTS "Users can insert their company settings" ON company_settings;
DROP POLICY IF EXISTS "Users can update their company settings" ON company_settings;
DROP POLICY IF EXISTS "Users can delete their company settings" ON company_settings;

-- Criar políticas RLS corretas que permitam acesso baseado na empresa
CREATE POLICY "Users can view their company settings" ON company_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = company_settings.company_id 
      AND (
        -- Super admin pode acessar qualquer empresa
        ((auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin') OR
        -- Admin de empresa pode acessar sua empresa
        (companies.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain'))
      )
    )
  );

CREATE POLICY "Users can insert their company settings" ON company_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = company_settings.company_id 
      AND (
        -- Super admin pode inserir para qualquer empresa
        ((auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin') OR
        -- Admin de empresa pode inserir para sua empresa
        (companies.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain'))
      )
    )
  );

CREATE POLICY "Users can update their company settings" ON company_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = company_settings.company_id 
      AND (
        -- Super admin pode atualizar qualquer empresa
        ((auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin') OR
        -- Admin de empresa pode atualizar sua empresa
        (companies.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain'))
      )
    )
  );

CREATE POLICY "Users can delete their company settings" ON company_settings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = company_settings.company_id 
      AND (
        -- Super admin pode deletar qualquer empresa
        ((auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin') OR
        -- Admin de empresa pode deletar sua empresa
        (companies.domain = (auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain'))
      )
    )
  );