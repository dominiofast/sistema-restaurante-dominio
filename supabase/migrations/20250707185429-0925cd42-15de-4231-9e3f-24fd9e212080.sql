-- Inserir dados de teste para visualizar o seletor funcionando

-- Primeiro, criar uma configuração global do app iFood
INSERT INTO public.ifood_app_config (app_name, client_id, client_secret, environment, is_active, notes) 
VALUES 
('MenuCloud App', 'test_client_id_123', 'test_client_secret_456', 'sandbox', true, 'Configuração de teste para desenvolvimento');

-- Buscar o ID da configuração que acabou de ser criada e IDs das empresas
DO $$
DECLARE
    app_config_id UUID;
    quadrata_company_id UUID;
    graus_company_id UUID;
    dominio_company_id UUID;
BEGIN
    -- Buscar ID da configuração do app
    SELECT id INTO app_config_id FROM public.ifood_app_config WHERE app_name = 'MenuCloud App';
    
    -- Buscar IDs das empresas (usando ILIKE para busca mais flexível)
    SELECT id INTO quadrata_company_id FROM public.companies WHERE name ILIKE '%quadrata%' LIMIT 1;
    SELECT id INTO graus_company_id FROM public.companies WHERE name ILIKE '%300%graus%' OR name ILIKE '%graus%' LIMIT 1;
    SELECT id INTO dominio_company_id FROM public.companies WHERE name ILIKE '%dominio%' LIMIT 1;
    
    -- Inserir integrações de teste se as empresas existirem
    IF quadrata_company_id IS NOT NULL AND app_config_id IS NOT NULL THEN
        INSERT INTO public.ifood_integrations (company_id, merchant_id, store_name, ifood_app_config_id, is_active, notes)
        VALUES (quadrata_company_id, 'QUAD_001', 'Quadrata Pizzas - Loja Centro', app_config_id, true, 'Loja principal do centro da cidade');
        
        INSERT INTO public.ifood_integrations (company_id, merchant_id, store_name, ifood_app_config_id, is_active, notes)
        VALUES (quadrata_company_id, 'QUAD_002', 'Quadrata Pizzas - Loja Shopping', app_config_id, true, 'Loja do shopping');
    END IF;
    
    IF graus_company_id IS NOT NULL AND app_config_id IS NOT NULL THEN
        INSERT INTO public.ifood_integrations (company_id, merchant_id, store_name, ifood_app_config_id, is_active, notes)
        VALUES (graus_company_id, '300G_001', '300 Graus - Delivery Principal', app_config_id, true, 'Unidade principal de delivery');
    END IF;
    
    IF dominio_company_id IS NOT NULL AND app_config_id IS NOT NULL THEN
        INSERT INTO public.ifood_integrations (company_id, merchant_id, store_name, ifood_app_config_id, is_active, notes)
        VALUES (dominio_company_id, 'DOM_001', 'Domínio Pizzas - Matriz', app_config_id, true, 'Loja matriz');
    END IF;
END $$;