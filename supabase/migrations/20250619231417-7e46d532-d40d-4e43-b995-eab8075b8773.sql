
-- Create pedidos table
CREATE TABLE public.pedidos (
  id SERIAL PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  nome VARCHAR(255),
  telefone VARCHAR(20),
  endereco TEXT,
  status VARCHAR(50) DEFAULT 'analise',
  tipo VARCHAR(50) DEFAULT 'delivery',
  total DECIMAL(10,2) DEFAULT 0,
  pagamento VARCHAR(50),
  horario VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view pedidos from their company" ON public.pedidos
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM public.companies WHERE id = company_id
    )
  );

CREATE POLICY "Users can insert pedidos for their company" ON public.pedidos
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE id = company_id
    )
  );

CREATE POLICY "Users can update pedidos from their company" ON public.pedidos
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM public.companies WHERE id = company_id
    )
  );

-- Create trigger to update updated_at
CREATE TRIGGER update_pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
