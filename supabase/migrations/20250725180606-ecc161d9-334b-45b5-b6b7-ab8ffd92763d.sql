-- Configuração da IA por loja
create table if not exists agente_ia_config (
  id bigserial primary key,
  slug_empresa text not null unique,
  nome_empresa text not null,
  nome_assistente text,
  mensagem_boas_vindas text,
  mensagem_ausencia text,
  mensagem_despedida text,
  frases_venda jsonb
);

-- Cardápio
create table if not exists cardapio (
  id bigserial primary key,
  slug_empresa text not null references agente_ia_config(slug_empresa) on delete cascade,
  nome text not null,
  descricao text,
  preco numeric(10,2) not null,
  promocao boolean default false,
  data_inicio_promocao date,
  data_fim_promocao date
);

-- Índice para performance
create index on cardapio(slug_empresa);