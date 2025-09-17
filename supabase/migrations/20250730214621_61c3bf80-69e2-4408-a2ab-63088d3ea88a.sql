-- Relaxar as políticas RLS para permitir acesso de usuários autenticados aos programas
DROP POLICY IF EXISTS "Super admins can manage programas_saipos" ON public.programas_saipos;

-- Criar nova política mais permissiva para usuários autenticados
CREATE POLICY "Authenticated users can manage programas_saipos"
ON public.programas_saipos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Permitir acesso público para leitura (para downloads)
CREATE POLICY "Public can view programas_saipos"
ON public.programas_saipos
FOR SELECT
TO public
USING (ativo = true);