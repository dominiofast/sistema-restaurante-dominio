
-- Adiciona o campo 'store_code' como inteiro único
ALTER TABLE companies ADD COLUMN store_code integer UNIQUE;

-- Preenche para todas as lojas existentes, começando do 1000
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) + 999 AS seq
  FROM companies
)
UPDATE companies
SET store_code = numbered.seq
FROM numbered
WHERE companies.id = numbered.id;

-- Cria a sequência para próximas lojas (corrigindo a sintaxe)
DO $$
DECLARE
    next_value integer;
BEGIN
    SELECT COALESCE(MAX(store_code), 999) + 1 INTO next_value FROM companies;
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS companies_store_code_seq START WITH %s', next_value);
END $$;

-- Define o valor padrão para usar a sequência
ALTER TABLE companies ALTER COLUMN store_code SET DEFAULT nextval('companies_store_code_seq');
