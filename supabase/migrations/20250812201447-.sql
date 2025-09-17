-- 1) Tabela por loja para vincular Assistants da OpenAI e caminhos dos JSONs
create table if not exists public.ai_agent_assistants (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  bot_name text not null default 'RangoBot',
  assistant_id text not null,
  cardapio_url text,
  produtos_path text not null,
  config_path text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id)
);

-- Habilitar RLS
alter table public.ai_agent_assistants enable row level security;

-- Função padrão de updated_at (já existe em public.update_updated_at_column)
create trigger trg_ai_agent_assistants_updated_at
before update on public.ai_agent_assistants
for each row execute function public.update_updated_at_column();

-- Políticas: permitir que a empresa do usuário (ou super_admin) gerencie seu registro
create policy if not exists "Company manage ai_agent_assistants"
  on public.ai_agent_assistants
  for all
  using ((company_id = public.get_user_company_id()) or (public.get_user_role() = 'super_admin'))
  with check ((company_id = public.get_user_company_id()) or (public.get_user_role() = 'super_admin'));

-- 2) Bucket de Storage para os arquivos JSON por loja
insert into storage.buckets (id, name, public)
values ('ai-knowledge', 'ai-knowledge', false)
on conflict (id) do nothing;

-- Políticas no storage.objects para o bucket 'ai-knowledge'
-- Convenção de path: <company_id>/<arquivo>.json  (ex.: 3f6c.../produtos.json)
create policy if not exists "Company select ai-knowledge"
  on storage.objects for select
  using (
    bucket_id = 'ai-knowledge'
    and (
      public.get_user_role() = 'super_admin'
      or public.get_user_company_id()::text = (storage.foldername(name))[1]
    )
  );

create policy if not exists "Company insert ai-knowledge"
  on storage.objects for insert
  with check (
    bucket_id = 'ai-knowledge'
    and (
      public.get_user_role() = 'super_admin'
      or public.get_user_company_id()::text = (storage.foldername(name))[1]
    )
  );

create policy if not exists "Company update ai-knowledge"
  on storage.objects for update
  using (
    bucket_id = 'ai-knowledge'
    and (
      public.get_user_role() = 'super_admin'
      or public.get_user_company_id()::text = (storage.foldername(name))[1]
    )
  )
  with check (
    bucket_id = 'ai-knowledge'
    and (
      public.get_user_role() = 'super_admin'
      or public.get_user_company_id()::text = (storage.foldername(name))[1]
    )
  );

create policy if not exists "Company delete ai-knowledge"
  on storage.objects for delete
  using (
    bucket_id = 'ai-knowledge'
    and (
      public.get_user_role() = 'super_admin'
      or public.get_user_company_id()::text = (storage.foldername(name))[1]
    )
  );