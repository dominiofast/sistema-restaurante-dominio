-- Safe re-runnable migration
-- 1) Table for per-store OpenAI Assistant linkage and JSON paths
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

alter table public.ai_agent_assistants enable row level security;

-- Recreate trigger safely
drop trigger if exists trg_ai_agent_assistants_updated_at on public.ai_agent_assistants;
create trigger trg_ai_agent_assistants_updated_at
before update on public.ai_agent_assistants
for each row execute function public.update_updated_at_column();

-- Policies (drop if exists to allow re-run)
drop policy if exists "Company manage ai_agent_assistants" on public.ai_agent_assistants;
create policy "Company manage ai_agent_assistants"
  on public.ai_agent_assistants
  for all
  using ((company_id = public.get_user_company_id()) or (public.get_user_role() = 'super_admin'))
  with check ((company_id = public.get_user_company_id()) or (public.get_user_role() = 'super_admin'));

-- 2) Storage bucket for per-store JSONs (private)
insert into storage.buckets (id, name, public)
values ('ai-knowledge', 'ai-knowledge', false)
on conflict (id) do nothing;

-- Storage policies for bucket 'ai-knowledge'
-- Path convention: <company_id>/<arquivo>.json
-- Recreate safely
drop policy if exists "Company select ai-knowledge" on storage.objects;
create policy "Company select ai-knowledge"
  on storage.objects for select
  using (
    bucket_id = 'ai-knowledge'
    and (
      public.get_user_role() = 'super_admin'
      or public.get_user_company_id()::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "Company insert ai-knowledge" on storage.objects;
create policy "Company insert ai-knowledge"
  on storage.objects for insert
  with check (
    bucket_id = 'ai-knowledge'
    and (
      public.get_user_role() = 'super_admin'
      or public.get_user_company_id()::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "Company update ai-knowledge" on storage.objects;
create policy "Company update ai-knowledge"
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

drop policy if exists "Company delete ai-knowledge" on storage.objects;
create policy "Company delete ai-knowledge"
  on storage.objects for delete
  using (
    bucket_id = 'ai-knowledge'
    and (
      public.get_user_role() = 'super_admin'
      or public.get_user_company_id()::text = (storage.foldername(name))[1]
    )
  );