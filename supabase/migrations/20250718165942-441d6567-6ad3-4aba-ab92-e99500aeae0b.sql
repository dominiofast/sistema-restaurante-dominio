-- Criar política para permitir leitura pública das configurações de pagamento
CREATE POLICY "Public can read payment config" ON public.payment_delivery_config
  FOR SELECT USING (true);

-- Criar política para permitir leitura pública das bandeiras de cartão
CREATE POLICY "Public can read card brands" ON public.payment_delivery_card_brands
  FOR SELECT USING (true);