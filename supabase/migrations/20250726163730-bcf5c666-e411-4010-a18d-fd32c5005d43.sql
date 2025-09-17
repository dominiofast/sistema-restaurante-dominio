-- ==========================================
-- CORREÇÃO CRÍTICA DE SEGURANÇA RLS - POLÍTICAS ESPECÍFICAS
-- Corrigir políticas que usam user_metadata de forma insegura
-- ==========================================

-- 1. Corrigir política da tabela programas_saipos
DROP POLICY IF EXISTS "Super admins can manage programas_saipos" ON public.programas_saipos;
CREATE POLICY "Super admins can manage programas_saipos" 
ON public.programas_saipos 
FOR ALL 
TO authenticated 
USING (get_user_role() = 'super_admin')
WITH CHECK (get_user_role() = 'super_admin');

-- 2. Corrigir políticas de storage para programas
DROP POLICY IF EXISTS "Super admins can upload programas files" ON storage.objects;
CREATE POLICY "Super admins can upload programas files" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'programas' AND 
  get_user_role() = 'super_admin'
);

DROP POLICY IF EXISTS "Super admins can delete programas files" ON storage.objects;
CREATE POLICY "Super admins can delete programas files" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'programas' AND 
  get_user_role() = 'super_admin'
);

-- 3. Corrigir políticas das tabelas de RH/vagas
DROP POLICY IF EXISTS "Allow users to manage config for their own company domain" ON public.rh_vagas_config;
CREATE POLICY "Allow users to manage config for their own company domain" 
ON public.rh_vagas_config 
FOR ALL 
TO authenticated 
USING (
  company_id IN (
    SELECT companies.id FROM companies 
    WHERE companies.domain = get_user_company_domain()
  )
);

DROP POLICY IF EXISTS "Allow users to manage vagas for their own company domain" ON public.rh_vagas;
CREATE POLICY "Allow users to manage vagas for their own company domain" 
ON public.rh_vagas 
FOR ALL 
TO authenticated 
USING (
  company_id IN (
    SELECT companies.id FROM companies 
    WHERE companies.domain = get_user_company_domain()
  )
);

DROP POLICY IF EXISTS "Allow super admins to manage all vagas" ON public.rh_vagas;
CREATE POLICY "Allow super admins to manage all vagas" 
ON public.rh_vagas 
FOR ALL 
TO authenticated 
USING (get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "Allow users to manage their own vagas config" ON public.rh_vagas_config;
CREATE POLICY "Allow users to manage their own vagas config" 
ON public.rh_vagas_config 
FOR ALL 
TO authenticated 
USING (
  company_id = (
    SELECT companies.id FROM companies 
    WHERE companies.domain = get_user_company_domain()
  )
);

DROP POLICY IF EXISTS "Allow super admins to manage all vagas config" ON public.rh_vagas_config;
CREATE POLICY "Allow super admins to manage all vagas config" 
ON public.rh_vagas_config 
FOR ALL 
TO authenticated 
USING (get_user_role() = 'super_admin');