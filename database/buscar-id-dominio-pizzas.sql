-- Query para buscar o ID da Domínio Pizzas
-- Execute esta query no SQL Editor do Supabase

-- Buscar empresas com nome parecido com Domínio Pizzas
SELECT 
    id as company_id,
    name as nome_empresa,
    slug,
    domain,
    created_at,
    CASE 
        WHEN active = true THEN 'Ativa ✅'
        ELSE 'Inativa ❌'
    END as status
FROM companies
WHERE 
    LOWER(name) LIKE '%dominio%' 
    OR LOWER(name) LIKE '%domínio%'
    OR LOWER(slug) LIKE '%dominio%'
ORDER BY created_at DESC;

-- Se quiser buscar TODAS as empresas (para encontrar o nome exato)
-- Descomente a query abaixo:
/*
SELECT 
    id as company_id,
    name as nome_empresa,
    slug,
    domain,
    active
FROM companies
ORDER BY name;
*/ 