-- Garantir que as tabelas WhatsApp estão configuradas para realtime
ALTER TABLE public.whatsapp_messages REPLICA IDENTITY FULL;
ALTER TABLE public.whatsapp_chats REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação realtime se ainda não estiverem
DO $$
BEGIN
    -- Adicionar whatsapp_messages à publicação realtime se não existir
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'whatsapp_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_messages;
    END IF;
    
    -- Adicionar whatsapp_chats à publicação realtime se não existir
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'whatsapp_chats'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_chats;
    END IF;
END $$;