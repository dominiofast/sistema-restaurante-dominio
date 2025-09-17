-- Script para verificar status dos avatares do WhatsApp
-- Execute este script para verificar se as fotos dos clientes estão sendo sincronizadas

-- 1. Verificar estrutura da tabela whatsapp_chats
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'whatsapp_chats' 
AND column_name IN ('contact_avatar', 'contact_name', 'contact_phone', 'unread_count')
ORDER BY ordinal_position;

-- 2. Contar total de chats e quantos têm avatar
SELECT 
    COUNT(*) as total_chats,
    COUNT(contact_avatar) as chats_com_avatar,
    COUNT(*) - COUNT(contact_avatar) as chats_sem_avatar,
    ROUND((COUNT(contact_avatar)::DECIMAL / COUNT(*)) * 100, 2) as percentual_com_avatar
FROM whatsapp_chats;

-- 3. Ver últimos 10 chats com avatar
SELECT 
    chat_id,
    contact_name,
    contact_phone,
    CASE 
        WHEN contact_avatar IS NOT NULL THEN '✅ Tem foto'
        ELSE '❌ Sem foto'
    END as status_avatar,
    contact_avatar,
    last_message_time,
    unread_count
FROM whatsapp_chats 
ORDER BY updated_at DESC 
LIMIT 10;

-- 4. Ver chats sem avatar (candidatos para sincronização)
SELECT 
    chat_id,
    contact_name,
    contact_phone,
    last_message_time,
    unread_count,
    updated_at
FROM whatsapp_chats 
WHERE contact_avatar IS NULL 
ORDER BY last_message_time DESC 
LIMIT 10;

-- 5. Verificar se a função sync-contact-avatars existe
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'sync-contact-avatars';

-- 6. Verificar integrações WhatsApp ativas
SELECT 
    company_id,
    instance_key,
    phone_number,
    status,
    created_at
FROM whatsapp_integrations 
WHERE purpose = 'primary' 
AND status = 'active'
ORDER BY created_at DESC;

-- 7. Estatísticas por empresa
SELECT 
    c.name as empresa,
    COUNT(wc.id) as total_chats,
    COUNT(wc.contact_avatar) as chats_com_avatar,
    ROUND((COUNT(wc.contact_avatar)::DECIMAL / COUNT(wc.id)) * 100, 2) as percentual_avatar
FROM whatsapp_chats wc
JOIN companies c ON wc.company_id = c.id
GROUP BY c.id, c.name
ORDER BY total_chats DESC;

-- 8. Verificar mensagens recentes para entender o fluxo
SELECT 
    wm.chat_id,
    wm.contact_name,
    wm.contact_phone,
    wm.message_content,
    wm.timestamp,
    wc.contact_avatar,
    CASE 
        WHEN wc.contact_avatar IS NOT NULL THEN '✅'
        ELSE '❌'
    END as tem_avatar
FROM whatsapp_messages wm
LEFT JOIN whatsapp_chats wc ON wm.chat_id = wc.chat_id
WHERE wm.timestamp > NOW() - INTERVAL '7 days'
ORDER BY wm.timestamp DESC 
LIMIT 20;
