-- 1) Remover duplicatas mantendo o registro mais recente por empresa
DELETE FROM public.ai_agent_assistants a
USING public.ai_agent_assistants b
WHERE a.company_id = b.company_id
  AND a.id <> b.id
  AND a.created_at < b.created_at;

-- 2) Adicionar restrição única para permitir UPSERT com on_conflict=company_id
ALTER TABLE public.ai_agent_assistants
ADD CONSTRAINT ai_agent_assistants_company_id_unique UNIQUE (company_id);