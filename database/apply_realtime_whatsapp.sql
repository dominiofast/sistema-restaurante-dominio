-- Enable REPLICA IDENTITY FULL for whatsapp tables
ALTER TABLE IF EXISTS public.whatsapp_messages REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.whatsapp_chats REPLICA IDENTITY FULL;

-- Enable RLS (diagnostic phase; later we will tighten policies)
ALTER TABLE IF EXISTS public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.whatsapp_chats ENABLE ROW LEVEL SECURITY;

-- Add tables to supabase_realtime publication if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname='public' AND tablename='whatsapp_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname='public' AND tablename='whatsapp_chats'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_chats;
  END IF;
END
$$;

-- Permissive policies for diagnostics (idempotent creation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='whatsapp_messages' AND policyname='Allow all operations on whatsapp_messages'
  ) THEN
    CREATE POLICY "Allow all operations on whatsapp_messages" ON public.whatsapp_messages FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='whatsapp_chats' AND policyname='Allow all operations on whatsapp_chats'
  ) THEN
    CREATE POLICY "Allow all operations on whatsapp_chats" ON public.whatsapp_chats FOR ALL USING (true);
  END IF;
END
$$;

-- Show current status for confirmation
SELECT 'Replica identity' as info, c.relname, c.relreplident
FROM pg_class c
WHERE c.relname IN ('whatsapp_messages','whatsapp_chats');

SELECT 'Publication membership' as info, schemaname, tablename
FROM pg_publication_tables
WHERE pubname='supabase_realtime' AND tablename IN ('whatsapp_messages','whatsapp_chats')
ORDER BY tablename;

SELECT 'Policies' as info, policyname, tablename
FROM pg_policies
WHERE schemaname='public' AND tablename IN ('whatsapp_messages','whatsapp_chats')
ORDER BY tablename, policyname;