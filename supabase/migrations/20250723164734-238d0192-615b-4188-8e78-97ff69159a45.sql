-- Corrigir política RLS para permitir fechamento de turno sem autenticação
-- ou criar uma função específica para fechamento

-- Primeiro, vamos permitir que usuários não autenticados fechem turnos temporariamente
CREATE POLICY "Allow public to update turnos for closing"
ON public.turnos
FOR UPDATE
USING (true)
WITH CHECK (true);