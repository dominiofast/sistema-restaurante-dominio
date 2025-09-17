-- Criar usuário admin manualmente para a Quadrata
-- (Por enquanto criamos via SQL até a Edge Function estar funcionando perfeitamente)

-- Verificar se o usuário realmente não existe
SELECT 'Verificando usuário existente' as status, COUNT(*) as count
FROM auth.users 
WHERE email = 'quadratapizzas@dominiopizzas.com.br';

-- Inserir credenciais na tabela company_credentials para referência
INSERT INTO company_credentials (
  company_id,
  email,
  password_hash
) VALUES (
  'edbb378a-d3c3-4914-b951-840cd701c8cb',
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
  'edbb378a-d3c3-4914-b951-840cd701c8cb',
  'manual_user_creation_needed',
  'admin_setup',
  0,
  'Usuário admin precisa ser criado no Dashboard: quadratapizzas@dominiopizzas.com.br'
);

SELECT 'Processo concluído - Criar usuário no Dashboard' as resultado;