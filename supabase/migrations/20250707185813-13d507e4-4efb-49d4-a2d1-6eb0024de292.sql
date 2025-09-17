-- Criar pedidos de teste para demonstrar o filtro de lojas funcionando

-- Buscar IDs de empresas para criar pedidos de teste
DO $$
DECLARE
    quadrata_company_id UUID;
    graus_company_id UUID;
    dominio_company_id UUID;
BEGIN
    -- Buscar IDs das empresas
    SELECT id INTO quadrata_company_id FROM public.companies WHERE name ILIKE '%quadrata%' LIMIT 1;
    SELECT id INTO graus_company_id FROM public.companies WHERE name ILIKE '%300%graus%' OR name ILIKE '%graus%' LIMIT 1;
    SELECT id INTO dominio_company_id FROM public.companies WHERE name ILIKE '%dominio%' LIMIT 1;
    
    -- Criar pedidos de teste para Quadrata (2 lojas)
    IF quadrata_company_id IS NOT NULL THEN
        -- Pedidos da Loja Centro (QUAD_001)
        INSERT INTO public.pedidos (company_id, nome, telefone, endereco, status, tipo, total, pagamento, origem, external_id, external_platform, created_at)
        VALUES 
        (quadrata_company_id, 'Cliente Centro 1', '(11) 99999-1111', 'Rua Centro, 123', 'analise', 'delivery', 45.90, 'PIX', 'ifood', 'QUAD_001', 'ifood', NOW() - INTERVAL '1 hour'),
        (quadrata_company_id, 'Cliente Centro 2', '(11) 99999-2222', 'Av. Central, 456', 'preparacao', 'delivery', 67.50, 'Cartão', 'ifood', 'QUAD_001', 'ifood', NOW() - INTERVAL '30 minutes'),
        (quadrata_company_id, 'Cliente Centro 3', '(11) 99999-3333', 'Praça Principal, 789', 'pronto', 'delivery', 32.80, 'Dinheiro', 'ifood', 'QUAD_001', 'ifood', NOW() - INTERVAL '15 minutes');
        
        -- Pedidos da Loja Shopping (QUAD_002)  
        INSERT INTO public.pedidos (company_id, nome, telefone, endereco, status, tipo, total, pagamento, origem, external_id, external_platform, created_at)
        VALUES 
        (quadrata_company_id, 'Cliente Shopping 1', '(11) 88888-1111', 'Shopping Center, Loja 12', 'analise', 'delivery', 55.20, 'PIX', 'ifood', 'QUAD_002', 'ifood', NOW() - INTERVAL '45 minutes'),
        (quadrata_company_id, 'Cliente Shopping 2', '(11) 88888-2222', 'Condomínio Park, 234', 'preparacao', 'delivery', 78.90, 'Cartão', 'ifood', 'QUAD_002', 'ifood', NOW() - INTERVAL '20 minutes');
        
        -- Pedidos diretos (sem external_id) para mostrar a diferença
        INSERT INTO public.pedidos (company_id, nome, telefone, endereco, status, tipo, total, pagamento, origem, created_at)
        VALUES 
        (quadrata_company_id, 'Cliente Direto 1', '(11) 77777-1111', 'Rua Direta, 111', 'analise', 'delivery', 25.50, 'PIX', 'site', NOW() - INTERVAL '10 minutes'),
        (quadrata_company_id, 'Cliente Direto 2', '(11) 77777-2222', 'Av. Direta, 222', 'preparacao', 'delivery', 42.30, 'Cartão', 'site', NOW() - INTERVAL '5 minutes');
    END IF;
    
    -- Criar pedidos de teste para 300 Graus
    IF graus_company_id IS NOT NULL THEN
        INSERT INTO public.pedidos (company_id, nome, telefone, endereco, status, tipo, total, pagamento, origem, external_id, external_platform, created_at)
        VALUES 
        (graus_company_id, 'Cliente 300 Graus 1', '(11) 66666-1111', 'Rua Quente, 300', 'analise', 'delivery', 89.90, 'PIX', 'ifood', '300G_001', 'ifood', NOW() - INTERVAL '25 minutes'),
        (graus_company_id, 'Cliente 300 Graus 2', '(11) 66666-2222', 'Av. Forno, 400', 'preparacao', 'delivery', 125.50, 'Cartão', 'ifood', '300G_001', 'ifood', NOW() - INTERVAL '35 minutes');
    END IF;
    
    -- Criar pedidos de teste para Domínio Pizzas
    IF dominio_company_id IS NOT NULL THEN
        INSERT INTO public.pedidos (company_id, nome, telefone, endereco, status, tipo, total, pagamento, origem, external_id, external_platform, created_at)
        VALUES 
        (dominio_company_id, 'Cliente Domínio 1', '(11) 55555-1111', 'Rua Domínio, 500', 'analise', 'delivery', 65.70, 'PIX', 'ifood', 'DOM_001', 'ifood', NOW() - INTERVAL '40 minutes'),
        (dominio_company_id, 'Cliente Domínio 2', '(11) 55555-2222', 'Av. Pizza, 600', 'preparacao', 'delivery', 95.20, 'Cartão', 'ifood', 'DOM_001', 'ifood', NOW() - INTERVAL '50 minutes');
    END IF;
    
END $$;