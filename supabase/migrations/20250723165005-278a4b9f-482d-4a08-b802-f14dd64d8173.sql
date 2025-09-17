-- Remover a constraint problemática e criar uma melhor
DROP INDEX IF EXISTS unique_company_turno_aberto;

-- Criar constraint que só impede múltiplos turnos ABERTOS
CREATE UNIQUE INDEX unique_company_turno_aberto_only 
ON public.turnos (company_id) 
WHERE status = 'aberto';