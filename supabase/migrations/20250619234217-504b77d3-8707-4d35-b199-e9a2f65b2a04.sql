
-- Criar tabela whatsapp_chats
CREATE TABLE public.whatsapp_chats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  chat_id text NOT NULL,
  contact_name text,
  contact_phone text NOT NULL,
  contact_avatar text,
  last_message text,
  last_message_time timestamp with time zone,
  unread_count integer DEFAULT 0,
  is_archived boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(company_id, chat_id)
);

-- Criar tabela whatsapp_messages
CREATE TABLE public.whatsapp_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  chat_id text NOT NULL,
  contact_name text,
  contact_phone text NOT NULL,
  contact_avatar text,
  message_id text NOT NULL,
  message_content text,
  message_type text DEFAULT 'text',
  media_url text,
  is_from_me boolean DEFAULT false,
  status text DEFAULT 'sent',
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_whatsapp_chats_company_id ON public.whatsapp_chats(company_id);
CREATE INDEX idx_whatsapp_chats_chat_id ON public.whatsapp_chats(chat_id);
CREATE INDEX idx_whatsapp_messages_company_id ON public.whatsapp_messages(company_id);
CREATE INDEX idx_whatsapp_messages_chat_id ON public.whatsapp_messages(chat_id);
CREATE INDEX idx_whatsapp_messages_timestamp ON public.whatsapp_messages(timestamp);

-- Habilitar RLS
ALTER TABLE public.whatsapp_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (permitir acesso total por enquanto, pode ser refinado depois)
CREATE POLICY "Allow all operations on whatsapp_chats" ON public.whatsapp_chats FOR ALL USING (true);
CREATE POLICY "Allow all operations on whatsapp_messages" ON public.whatsapp_messages FOR ALL USING (true);
