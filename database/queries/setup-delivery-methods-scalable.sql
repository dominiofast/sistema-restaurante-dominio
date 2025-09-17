-- ====================================================================
-- SCRIPT DE CONFIGURAÇÃO ESCALÁVEL PARA DELIVERY METHODS
-- ====================================================================
-- Este script garante que todas as empresas tenham configurações
-- de delivery corretas e cria registros faltantes automaticamente
-- ====================================================================

-- 1. CRIAR REGISTROS FALTANTES
-- Cria delivery_methods para empresas que ainda não têm
INSERT INTO delivery_methods (company_id, delivery, pickup, eat_in, created_at, updated_at)
SELECT 
    c.id as company_id,
    true as delivery,  -- Padrão: delivery habilitado
    true as pickup,    -- Padrão: pickup habilitado
    false as eat_in,   -- Padrão: eat_in desabilitado
    NOW() as created_at,
    NOW() as updated_at
FROM companies c
WHERE c.id NOT IN (
    SELECT company_id 
    FROM delivery_methods
)
ON CONFLICT (company_id) DO NOTHING;

-- 2. CORRIGIR CONFIGURAÇÕES ESPECÍFICAS CONHECIDAS
-- 300 Graus: APENAS delivery (sem retirada)
UPDATE delivery_methods
SET 
    delivery = true,
    pickup = false,
    eat_in = false,
    updated_at = NOW()
WHERE company_id IN (
    SELECT id FROM companies 
    WHERE LOWER(name) LIKE '%300%graus%' 
       OR slug = '300graus'
);

-- Domínio Pizzas: Delivery + Retirada
UPDATE delivery_methods
SET 
    delivery = true,
    pickup = true,
    eat_in = false,
    updated_at = NOW()
WHERE company_id IN (
    SELECT id FROM companies 
    WHERE LOWER(name) LIKE '%dominio%' 
       OR LOWER(name) LIKE '%domínio%'
       OR slug LIKE '%dominio%'
);

-- 3. VERIFICAR INTEGRIDADE
-- Garantir que toda empresa tem pelo menos uma opção ativa
UPDATE delivery_methods
SET 
    pickup = true,  -- Se nada estiver ativo, habilitar pickup como fallback
    updated_at = NOW()
WHERE delivery = false 
  AND pickup = false 
  AND eat_in = false;

-- 4. CRIAR FUNÇÃO PARA AUTO-CRIAR DELIVERY_METHODS
-- Esta função garante que sempre que uma empresa for criada,
-- ela automaticamente tenha suas configurações de delivery
CREATE OR REPLACE FUNCTION create_default_delivery_methods()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO delivery_methods (company_id, delivery, pickup, eat_in)
    VALUES (NEW.id, true, true, false)
    ON CONFLICT (company_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. CRIAR TRIGGER PARA NOVAS EMPRESAS
DROP TRIGGER IF EXISTS auto_create_delivery_methods ON companies;
CREATE TRIGGER auto_create_delivery_methods
    AFTER INSERT ON companies
    FOR EACH ROW
    EXECUTE FUNCTION create_default_delivery_methods();

-- 6. CRIAR FUNÇÃO DE VALIDAÇÃO
-- Impede que todas as opções sejam desabilitadas
CREATE OR REPLACE FUNCTION validate_delivery_methods()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.delivery = false AND NEW.pickup = false AND NEW.eat_in = false THEN
        RAISE EXCEPTION 'Pelo menos uma opção de entrega deve estar habilitada';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. CRIAR TRIGGER DE VALIDAÇÃO
DROP TRIGGER IF EXISTS validate_delivery_options ON delivery_methods;
CREATE TRIGGER validate_delivery_options
    BEFORE UPDATE ON delivery_methods
    FOR EACH ROW
    EXECUTE FUNCTION validate_delivery_methods();

-- 8. CRIAR VIEW PARA FACILITAR VISUALIZAÇÃO
CREATE OR REPLACE VIEW company_delivery_config AS
SELECT 
    c.id,
    c.name as empresa,
    c.slug,
    CASE 
        WHEN dm.delivery = true AND dm.pickup = true THEN '📦 Delivery + 🏪 Retirada'
        WHEN dm.delivery = true AND dm.pickup = false THEN '📦 APENAS Delivery'
        WHEN dm.delivery = false AND dm.pickup = true THEN '🏪 APENAS Retirada'
        WHEN dm.eat_in = true THEN '🍽️ Consumo no Local'
        ELSE '⚠️ Configuração Inválida'
    END as configuracao,
    dm.delivery,
    dm.pickup,
    dm.eat_in,
    dm.updated_at as ultima_atualizacao
FROM companies c
LEFT JOIN delivery_methods dm ON dm.company_id = c.id
ORDER BY c.name;

-- 9. VERIFICAR RESULTADOS
SELECT * FROM company_delivery_config;

-- 10. ESTATÍSTICAS FINAIS
SELECT 
    COUNT(*) as total_empresas,
    SUM(CASE WHEN delivery = true THEN 1 ELSE 0 END) as com_delivery,
    SUM(CASE WHEN pickup = true THEN 1 ELSE 0 END) as com_retirada,
    SUM(CASE WHEN eat_in = true THEN 1 ELSE 0 END) as com_consumo_local,
    SUM(CASE WHEN delivery = false AND pickup = false AND eat_in = false THEN 1 ELSE 0 END) as sem_configuracao
FROM delivery_methods;

-- ====================================================================
-- FIM DO SCRIPT
-- ====================================================================
-- Após executar este script:
-- 1. Todas as empresas terão configurações de delivery
-- 2. Novas empresas terão configurações criadas automaticamente
-- 3. Será impossível desabilitar todas as opções
-- 4. 300 Graus terá apenas delivery
-- 5. Domínio terá delivery + retirada
-- ====================================================================
