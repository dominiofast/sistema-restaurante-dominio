-- Make assistant_id nullable to allow placeholder creation
alter table public.ai_agent_assistants
  alter column assistant_id drop not null;

-- Create helper function to auto upsert ai_agent_assistants on company insert/update
create or replace function public.ensure_ai_agent_assistant()
returns trigger as $$
begin
  -- Upsert placeholder row with default paths
  insert into public.ai_agent_assistants (company_id, bot_name, cardapio_url, produtos_path, config_path, is_active)
  values (new.id, coalesce(new.name, 'RangoBot'), null, new.id::text || '/produtos.json', new.id::text || '/config.json', true)
  on conflict (company_id) do update set
    bot_name = excluded.bot_name,
    produtos_path = excluded.produtos_path,
    config_path = excluded.config_path,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Attach triggers to companies
 drop trigger if exists trg_companies_ai_agent_assistant on public.companies;
 create trigger trg_companies_ai_agent_assistant
 after insert or update of name, slug on public.companies
 for each row execute function public.ensure_ai_agent_assistant();

-- Enable extensions required for scheduled automation
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema extensions;

-- Schedule a cron job to invoke the edge function periodically (every 5 minutes)
-- It is safe to recreate; if exists, replace schedule
select
  cron.schedule(
    'ai-auto-setup-every-5min',
    '*/5 * * * *',
    $$
    select
      net.http_post(
        url := 'https://epqppxteicfuzdblbluq.functions.supabase.co/functions/v1/ai-auto-setup',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{"mode":"scan"}'::jsonb
      );
    $$
  );