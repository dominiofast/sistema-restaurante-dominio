
-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can manage their company payment config" ON public.payment_delivery_config;
DROP POLICY IF EXISTS "Users can manage their company card brands" ON public.payment_delivery_card_brands;
DROP POLICY IF EXISTS "Super admins can manage all payment configs" ON public.payment_delivery_config;
DROP POLICY IF EXISTS "Super admins can manage all card brands" ON public.payment_delivery_card_brands;

-- Criar políticas RLS corrigidas que não dependem de acessar auth.users diretamente
CREATE POLICY "Users can manage their company payment config" ON public.payment_delivery_config
  FOR ALL USING (
    company_id IN (
      SELECT id FROM public.companies 
      WHERE domain = (
        SELECT raw_user_meta_data->>'company_domain' 
        FROM auth.users 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage their company card brands" ON public.payment_delivery_card_brands
  FOR ALL USING (
    config_id IN (
      SELECT pdc.id FROM public.payment_delivery_config pdc
      WHERE pdc.company_id IN (
        SELECT id FROM public.companies 
        WHERE domain = (
          SELECT raw_user_meta_data->>'company_domain' 
          FROM auth.users 
          WHERE id = auth.uid()
        )
      )
    )
  );

-- Políticas simplificadas para super admins
CREATE POLICY "Super admins can manage all payment configs" ON public.payment_delivery_config
  FOR ALL USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Super admins can manage all card brands" ON public.payment_delivery_card_brands
  FOR ALL USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'super_admin'
  );
