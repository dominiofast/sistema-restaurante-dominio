-- CORREÇÃO FINAL DE SEGURANÇA - Proteger dados restantes (CORRIGIDO)

-- 1. Proteger tabelas de configuração sensíveis
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Política para configurações da empresa
CREATE POLICY "Company users can manage their settings" ON public.company_settings
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

-- 2. Proteger dados de pedidos e vendas
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_item_adicionais ENABLE ROW LEVEL SECURITY;

-- Política para pedidos
CREATE POLICY "Company users can manage their orders" ON public.pedidos
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

-- Política para itens de pedidos
CREATE POLICY "Company users can manage their order items" ON public.pedido_itens
    FOR ALL USING (
        pedido_id IN (
            SELECT p.id FROM pedidos p
            JOIN user_companies uc ON uc.company_id = p.company_id
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

-- Política para adicionais de itens
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

-- 3. Proteger logs e dados de auditoria
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can view their import logs" ON public.import_logs
    FOR SELECT USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

-- 4. Proteger dados de receitas e estoque
ALTER TABLE public.receitas_fichas_tecnicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas_ingredientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can manage their recipes" ON public.receitas_fichas_tecnicas
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

CREATE POLICY "Company users can manage their recipe ingredients" ON public.receitas_ingredientes
    FOR ALL USING (
        receita_id IN (
            SELECT r.id FROM receitas_fichas_tecnicas r
            JOIN user_companies uc ON uc.company_id = r.company_id
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

-- 5. Proteger dados de integração e configurações críticas
ALTER TABLE public.ifood_app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can manage their iFood config" ON public.ifood_app_config
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

CREATE POLICY "Company users can manage their credentials" ON public.company_credentials
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );