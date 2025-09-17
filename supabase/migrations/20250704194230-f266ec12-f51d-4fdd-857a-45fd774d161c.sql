-- Verificar se RLS está habilitado e temporariamente desabilitar para teste
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'nfce_logs';

-- Temporariamente desabilitar RLS para teste
ALTER TABLE public.nfce_logs DISABLE ROW LEVEL SECURITY;

-- Testar inserção simples
INSERT INTO public.nfce_logs (company_id, pedido_id, status)
VALUES ('550e8400-e29b-41d4-a716-446655440001', 998, 'teste_sem_rls')
RETURNING id, company_id, pedido_id, status;