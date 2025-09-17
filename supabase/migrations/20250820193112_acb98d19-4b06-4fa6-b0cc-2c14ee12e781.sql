-- CORREÇÃO FINAL DE SEGURANÇA - Proteger dados existentes

-- 1. Proteger dados de pedidos e vendas (se existirem)
DO $$
BEGIN
    -- Verificar se tabela pedidos existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pedidos') THEN
        ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
        
        -- Dropar política existente se houver
        DROP POLICY IF EXISTS "Company users can manage their orders" ON public.pedidos;
        
        CREATE POLICY "Company users can manage their orders" ON public.pedidos
            FOR ALL USING (
                company_id IN (
                    SELECT uc.company_id FROM user_companies uc
                    WHERE uc.user_id = auth.uid()
                    AND uc.is_active = true
                )
            );
    END IF;
END $$;

-- 2. Proteger itens de pedidos (se existirem)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pedido_itens') THEN
        ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Company users can manage their order items" ON public.pedido_itens;
        
        CREATE POLICY "Company users can manage their order items" ON public.pedido_itens
            FOR ALL USING (
                pedido_id IN (
                    SELECT p.id FROM pedidos p
                    JOIN user_companies uc ON uc.company_id = p.company_id
                    WHERE uc.user_id = auth.uid()
                    AND uc.is_active = true
                )
            );
    END IF;
END $$;

-- 3. Proteger adicionais de itens (se existirem)  
DO $$
BEGIN 
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pedido_item_adicionais') THEN
        ALTER TABLE public.pedido_item_adicionais ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Company users can manage their order item extras" ON public.pedido_item_adicionais;
        
        CREATE POLICY "Company users can manage their order item extras" ON public.pedido_item_adicionais
            FOR ALL USING (
                pedido_item_id IN (
                    SELECT pi.id FROM pedido_itens pi
                    JOIN pedidos p ON p.id = pi.pedido_id
                    JOIN user_companies uc ON uc.company_id = p.company_id
                    WHERE uc.user_id = auth.uid()
                    AND uc.is_active = true
                )
            );
    END IF;
END $$;

-- 4. Proteger receitas (se existirem)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'receitas_fichas_tecnicas') THEN
        ALTER TABLE public.receitas_fichas_tecnicas ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Company users can manage their recipes" ON public.receitas_fichas_tecnicas;
        
        CREATE POLICY "Company users can manage their recipes" ON public.receitas_fichas_tecnicas
            FOR ALL USING (
                company_id IN (
                    SELECT uc.company_id FROM user_companies uc
                    WHERE uc.user_id = auth.uid()
                    AND uc.is_active = true
                )
            );
    END IF;
END $$;

-- 5. Proteger ingredientes de receitas (se existirem)  
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'receitas_ingredientes') THEN
        ALTER TABLE public.receitas_ingredientes ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Company users can manage their recipe ingredients" ON public.receitas_ingredientes;
        
        CREATE POLICY "Company users can manage their recipe ingredients" ON public.receitas_ingredientes
            FOR ALL USING (
                receita_id IN (
                    SELECT r.id FROM receitas_fichas_tecnicas r
                    JOIN user_companies uc ON uc.company_id = r.company_id
                    WHERE uc.user_id = auth.uid()
                    AND uc.is_active = true
                )
            );
    END IF;
END $$;