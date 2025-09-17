-- Criar tabela de mensagens do WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Identificação da conversa
  chat_id TEXT NOT NULL, -- ID único do chat (remoteJid)
  contact_name TEXT,
  contact_phone TEXT NOT NULL,
  contact_avatar TEXT,
  
  -- Dados da mensagem
  message_id TEXT NOT NULL UNIQUE, -- ID único da mensagem do WhatsApp
  message_content TEXT,
  message_type VARCHAR(20) DEFAULT 'text', -- text, image, audio, video, document
  media_url TEXT,
  
  -- Metadados
  is_from_me BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'sent', -- sent, delivered, read
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Timestamps do sistema
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar tabela de conversas (chats)
CREATE TABLE IF NOT EXISTS public.whatsapp_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Identificação do chat
  chat_id TEXT NOT NULL UNIQUE,
  contact_name TEXT,
  contact_phone TEXT NOT NULL,
  contact_avatar TEXT,
  
  -- Status da conversa
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_whatsapp_messages_company_id ON public.whatsapp_messages(company_id);
CREATE INDEX idx_whatsapp_messages_chat_id ON public.whatsapp_messages(chat_id);
CREATE INDEX idx_whatsapp_messages_timestamp ON public.whatsapp_messages(timestamp DESC);
CREATE INDEX idx_whatsapp_chats_company_id ON public.whatsapp_chats(company_id);
CREATE INDEX idx_whatsapp_chats_last_message_time ON public.whatsapp_chats(last_message_time DESC);

-- Habilitar RLS
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_chats ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mensagens
CREATE POLICY "Users can view messages from their company" 
  ON public.whatsapp_messages 
  FOR SELECT 
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages for their company" 
  ON public.whatsapp_messages 
  FOR INSERT 
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages from their company" 
  ON public.whatsapp_messages 
  FOR UPDATE 
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Políticas RLS para chats
CREATE POLICY "Users can view chats from their company" 
  ON public.whatsapp_chats 
  FOR SELECT 
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert chats for their company" 
  ON public.whatsapp_chats 
  FOR INSERT 
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update chats from their company" 
  ON public.whatsapp_chats 
  FOR UPDATE 
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Função para atualizar o chat quando uma nova mensagem chegar
CREATE OR REPLACE FUNCTION update_chat_on_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir ou atualizar o chat
  INSERT INTO public.whatsapp_chats (
    company_id,
    chat_id,
    contact_name,
    contact_phone,
    contact_avatar,
    last_message,
    last_message_time,
    unread_count
  ) VALUES (
    NEW.company_id,
    NEW.chat_id,
    NEW.contact_name,
    NEW.contact_phone,
    NEW.contact_avatar,
    NEW.message_content,
    NEW.timestamp,
    CASE WHEN NEW.is_from_me = false THEN 1 ELSE 0 END
  )
  ON CONFLICT (chat_id) DO UPDATE SET
    last_message = EXCLUDED.last_message,
    last_message_time = EXCLUDED.last_message_time,
    unread_count = CASE 
      WHEN NEW.is_from_me = false THEN whatsapp_chats.unread_count + 1 
      ELSE 0 
    END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar chat automaticamente
CREATE TRIGGER update_chat_trigger
AFTER INSERT ON public.whatsapp_messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_on_new_message(); 