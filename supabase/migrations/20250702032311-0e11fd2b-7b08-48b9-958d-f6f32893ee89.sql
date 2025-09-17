-- Criar usuário admin diretamente para Quadrata Pizzas usando a nossa interface
-- Inserir na tabela company_credentials
INSERT INTO company_credentials (
  company_id,
  email,
  password_hash
) VALUES (
  '1b24dbf6-f7bd-406e-bd8f-71d2fce1bf91',
  'quadratapizzas@dominiopizzas.com.br',
  'managed_by_auth'
) ON CONFLICT (company_id) DO UPDATE SET
  email = EXCLUDED.email;

-- Log do processo
INSERT INTO import_logs (
  company_id,
  status,
  source_url,
  items_imported,
  error_message
) VALUES (
  '1b24dbf6-f7bd-406e-bd8f-71d2fce1bf91',
  'company_admin_ready',
  'manual_setup',
  1,
  'Quadrata Pizzas criada com sucesso! Usar interface /admin/company-users para criar usuário: quadratapizzas@dominiopizzas.com.br'
);