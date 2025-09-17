ALTER TABLE public.companies
ADD COLUMN min_order_value NUMERIC(10, 2) DEFAULT 0.00;

COMMENT ON COLUMN public.companies.min_order_value IS 'Valor mínimo do pedido para delivery.'; 