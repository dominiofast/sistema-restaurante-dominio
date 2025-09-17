
-- Criar tabela de produtos
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image text,
  price numeric(10,2) not null,
  description text,
  destaque boolean default false,
  categoria text,
  company_id uuid not null references public.companies(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Índice para busca rápida por empresa
create index produtos_company_id_idx on public.produtos(company_id);

-- Habilitar RLS
alter table public.produtos enable row level security;

-- Política para super_admin ver todos os produtos
create policy "Super admins can view all produtos" 
  on public.produtos 
  for select 
  using (true);

-- Política para company_admin ver apenas produtos da sua empresa
create policy "Company admins can view their company produtos" 
  on public.produtos 
  for select 
  using (company_id in (select id from public.companies));

-- Política para super_admin criar produtos
create policy "Super admins can create produtos" 
  on public.produtos 
  for insert 
  with check (true);

-- Política para company_admin criar produtos apenas para sua empresa
create policy "Company admins can create produtos for their company" 
  on public.produtos 
  for insert 
  with check (company_id in (select id from public.companies));

-- Política para super_admin atualizar produtos
create policy "Super admins can update produtos" 
  on public.produtos 
  for update 
  using (true);

-- Política para company_admin atualizar apenas produtos da sua empresa
create policy "Company admins can update their company produtos" 
  on public.produtos 
  for update 
  using (company_id in (select id from public.companies));

-- Política para super_admin deletar produtos
create policy "Super admins can delete produtos" 
  on public.produtos 
  for delete 
  using (true);

-- Política para company_admin deletar apenas produtos da sua empresa
create policy "Company admins can delete their company produtos" 
  on public.produtos 
  for delete 
  using (company_id in (select id from public.companies));

-- Inserir alguns produtos de exemplo
insert into public.produtos (name, image, price, description, destaque, categoria, company_id) 
select 
  'Combo Domínio Pizza Grande + Refrí 1,5l',
  '',
  64.99,
  'A escolha de quem sabe! Leve uma Pizza Grande deliciosa e um refrí gelado por um preço especial.',
  true,
  'Combos/Ofertas',
  id
from public.companies 
where domain = 'bellavista';

insert into public.produtos (name, image, price, description, destaque, categoria, company_id) 
select 
  'Combo Perfeito Pizza Giga + Refrí 1,5l',
  '',
  79.99,
  'Combo especial com Pizza Giga e refrigerante.',
  true,
  'Combos/Ofertas',
  id
from public.companies 
where domain = 'bellavista';

insert into public.produtos (name, image, price, description, categoria, company_id) 
select 
  '2 Pizzas Médias',
  '',
  94.99,
  'Promoção especial: 2 pizzas médias.',
  'Pizzas',
  id
from public.companies 
where domain = 'bellavista';

insert into public.produtos (name, image, price, description, categoria, company_id) 
select 
  '2 Pizzas Grandes',
  '',
  109.99,
  'Promoção especial: 2 pizzas grandes.',
  'Pizzas',
  id
from public.companies 
where domain = 'bellavista';
