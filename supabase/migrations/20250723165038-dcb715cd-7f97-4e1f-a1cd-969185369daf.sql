-- Remover a constraint problemática e criar uma melhor
ALTER TABLE public.turnos DROP CONSTRAINT unique_company_turno_aberto;

-- Criar constraint que só impede múltiplos turnos ABERTOS (não fechados)
CREATE UNIQUE INDEX unique_company_turno_aberto_only 
ON public.turnos (company_id) 
WHERE status = 'aberto';