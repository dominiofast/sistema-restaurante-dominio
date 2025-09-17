-- Atualizar credencial da empresa 300 Graus para o email correto
-- Substitua 'EMAIL_CORRETO_AQUI' pelo email que deve ter acesso à empresa 300 Graus
UPDATE company_credentials 
SET email = '300graus@dominiopizzas.com.br'  -- ou o email correto
WHERE company_id = 'a9837084-d798-4b35-9344-0fdad7e4203a';

-- Verificar a atualização
SELECT cc.email, c.name, c.domain 
FROM company_credentials cc
JOIN companies c ON c.id = cc.company_id  
WHERE c.id = 'a9837084-d798-4b35-9344-0fdad7e4203a';