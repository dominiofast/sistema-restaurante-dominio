-- CORREÇÃO URGENTE DE SEGURANÇA - Proteger dados de clientes

-- 1. Habilitar RLS em tabelas críticas sem RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;

-- 2. Políticas de segurança para proteger dados de clientes
-- Clientes: apenas empresa proprietária pode acessar
CREATE POLICY "Company users can manage their clients" ON public.clientes
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

-- Endereços de clientes: apenas empresa proprietária pode acessar  
CREATE POLICY "Company users can manage their customer addresses" ON public.customer_addresses
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

-- Mensagens WhatsApp: apenas empresa proprietária pode acessar
CREATE POLICY "Company users can manage their WhatsApp messages" ON public.whatsapp_messages
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

-- Chats WhatsApp: apenas empresa proprietária pode acessar
CREATE POLICY "Company users can manage their WhatsApp chats" ON public.whatsapp_chats
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

-- Endereços da empresa: apenas empresa proprietária pode acessar
CREATE POLICY "Company users can manage their company addresses" ON public.company_addresses
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

-- Informações da empresa: apenas empresa proprietária pode acessar
CREATE POLICY "Company users can manage their company info" ON public.company_info
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

-- 3. Políticas para acesso público limitado (cardápio público)
-- Permitir acesso público apenas para endereços de empresas ativas (para delivery)
CREATE POLICY "Public can view active company addresses for delivery" ON public.company_addresses
    FOR SELECT USING (
        company_id IN (
            SELECT id FROM companies WHERE status = 'active'
        )
    );

-- Permitir acesso público apenas a informações básicas de empresas ativas
CREATE POLICY "Public can view active company basic info" ON public.company_info
    FOR SELECT USING (
        company_id IN (
            SELECT id FROM companies WHERE status = 'active'
        )
    );