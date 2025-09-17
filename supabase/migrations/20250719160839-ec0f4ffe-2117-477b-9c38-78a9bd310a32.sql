-- Atualizar metadados do usuário de suporte para incluir acesso a todas as empresas
UPDATE auth.users 
SET raw_user_meta_data = json_build_object(
  'name', 'Suporte Técnico',
  'role', 'super_admin',
  'company_domain', 'all'
)
WHERE email = 'suporte@dominio.tech';