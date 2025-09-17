
-- Remover todas as políticas existentes das tabelas de configuração de pagamento
DROP POLICY IF EXISTS "Users can manage their company payment config" ON public.payment_delivery_config;
DROP POLICY IF EXISTS "Users can manage their company card brands" ON public.payment_delivery_card_brands;
DROP POLICY IF EXISTS "Super admins can manage all payment configs" ON public.payment_delivery_config;
DROP POLICY IF EXISTS "Super admins can manage all card brands" ON public.payment_delivery_card_brands;

-- Criar função auxiliar para verificar se o usuário pode acessar uma empresa
CREATE OR REPLACE FUNCTION public.can_access_company(target_company_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    CASE 
      -- Super admin pode acessar qualquer empresa
      WHEN (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'super_admin' THEN TRUE
      -- Admin de empresa pode acessar apenas sua empresa
      WHEN EXISTS (
        SELECT 1 FROM public.companies 
        WHERE id = target_company_id 
        AND domain = (SELECT raw_user_meta_data->>'company_domain' FROM auth.users WHERE id = auth.uid())
      ) THEN TRUE
      ELSE FALSE
    END;
$$;

-- Criar políticas RLS mais simples usando a função auxiliar
CREATE POLICY "Users can access payment config for their company" 
  ON public.payment_delivery_config
  FOR ALL USING (public.can_access_company(company_id));

CREATE POLICY "Users can access card brands for their company" 
  ON public.payment_delivery_card_brands
  FOR ALL USING (
    public.can_access_company((
      SELECT pdc.company_id 
      FROM public.payment_delivery_config pdc 
      WHERE pdc.id = config_id
    ))
  );

-- Garantir que as tabelas tenham RLS habilitado
ALTER TABLE public.payment_delivery_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_delivery_card_brands ENABLE ROW LEVEL SECURITY;
