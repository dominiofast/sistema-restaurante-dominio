-- RLS para pedidos públicos (cardápio) e logs necessários
-- Idempotente: só cria políticas que não existirem

-- 1) pedidos
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='pedidos' AND policyname='Anon insert pedidos (cardapio_publico)'
  ) THEN
    CREATE POLICY "Anon insert pedidos (cardapio_publico)"
    ON public.pedidos
    FOR INSERT TO anon
    WITH CHECK (
      origem = 'cardapio_publico' AND company_id IS NOT NULL AND total >= 0
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='pedidos' AND policyname='Anon select pedidos (cardapio_publico)'
  ) THEN
    CREATE POLICY "Anon select pedidos (cardapio_publico)"
    ON public.pedidos
    FOR SELECT TO anon
    USING (origem = 'cardapio_publico');
  END IF;
END $$;

-- 2) pedido_itens
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='pedido_itens' AND policyname='Anon insert pedido_itens (cardapio_publico)'
  ) THEN
    CREATE POLICY "Anon insert pedido_itens (cardapio_publico)"
    ON public.pedido_itens
    FOR INSERT TO anon
    WITH CHECK (
      pedido_id IN (
        SELECT id FROM public.pedidos WHERE origem = 'cardapio_publico'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='pedido_itens' AND policyname='Anon select pedido_itens (cardapio_publico)'
  ) THEN
    CREATE POLICY "Anon select pedido_itens (cardapio_publico)"
    ON public.pedido_itens
    FOR SELECT TO anon
    USING (
      pedido_id IN (
        SELECT id FROM public.pedidos WHERE origem = 'cardapio_publico'
      )
    );
  END IF;
END $$;

-- 3) pedido_item_adicionais
ALTER TABLE public.pedido_item_adicionais ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='pedido_item_adicionais' AND policyname='Anon insert pedido_item_adicionais (cardapio_publico)'
  ) THEN
    CREATE POLICY "Anon insert pedido_item_adicionais (cardapio_publico)"
    ON public.pedido_item_adicionais
    FOR INSERT TO anon
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.pedido_itens i
        JOIN public.pedidos p ON p.id = i.pedido_id
        WHERE i.id = pedido_item_id AND p.origem = 'cardapio_publico'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='pedido_item_adicionais' AND policyname='Anon select pedido_item_adicionais (cardapio_publico)'
  ) THEN
    CREATE POLICY "Anon select pedido_item_adicionais (cardapio_publico)"
    ON public.pedido_item_adicionais
    FOR SELECT TO anon
    USING (
      EXISTS (
        SELECT 1 FROM public.pedido_itens i
        JOIN public.pedidos p ON p.id = i.pedido_id
        WHERE i.id = pedido_item_id AND p.origem = 'cardapio_publico'
      )
    );
  END IF;
END $$;

-- 4) Permitir logs necessários gerados por triggers em pedidos públicos
ALTER TABLE public.ai_conversation_logs ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='ai_conversation_logs' AND policyname='Anon insert ai_conversation_logs (limited)'
  ) THEN
    CREATE POLICY "Anon insert ai_conversation_logs (limited)"
    ON public.ai_conversation_logs
    FOR INSERT TO anon
    WITH CHECK (
      company_id IS NOT NULL AND
      message_type IN (
        'notification_sent',
        'auto_print_trigger',
        'pedido_sync',
        'auto_print_config_missing',
        'ready_notification',
        'delivered_notification',
        'notification_error',
        'auto_print_log',
        'auto_print_error'
      )
    );
  END IF;
END $$;
