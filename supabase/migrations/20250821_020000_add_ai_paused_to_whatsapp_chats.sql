-- Adicionar campo ai_paused à tabela whatsapp_chats
ALTER TABLE public.whatsapp_chats 
ADD COLUMN IF NOT EXISTS ai_paused BOOLEAN DEFAULT FALSE;

-- Criar índice para otimizar consultas de pausa
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_ai_paused 
ON public.whatsapp_chats(company_id, chat_id, ai_paused) 
WHERE ai_paused = true;

-- Comentário explicativo
COMMENT ON COLUMN public.whatsapp_chats.ai_paused IS 'Indica se a IA está pausada para este chat específico';