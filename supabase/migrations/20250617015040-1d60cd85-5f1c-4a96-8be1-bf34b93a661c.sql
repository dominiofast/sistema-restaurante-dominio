
CREATE TABLE public.clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(120),
    telefone VARCHAR(30),
    documento VARCHAR(30),
    endereco TEXT,
    cidade VARCHAR(60),
    estado VARCHAR(2),
    cep VARCHAR(12),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ativo'
);

-- Habilitar Row Level Security
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Criar índices para melhor performance
CREATE INDEX idx_clientes_email ON public.clientes(email);
CREATE INDEX idx_clientes_telefone ON public.clientes(telefone);
CREATE INDEX idx_clientes_documento ON public.clientes(documento);
CREATE INDEX idx_clientes_status ON public.clientes(status);
