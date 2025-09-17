// Script para testar sincronização de avatares do WhatsApp
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSyncAvatars() {
  try {
    console.log('🔄 Testando sincronização de avatares...');
    
    // Buscar uma empresa para teste
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name')
      .limit(1);
    
    if (!companies || companies.length === 0) {
      console.log('❌ Nenhuma empresa encontrada');
      return;
    }
    
    const companyId = companies[0].id;
    console.log(`📋 Usando empresa: ${companies[0].name} (${companyId})`);
    
    // Buscar chats sem avatar
    const { data: chatsWithoutAvatar } = await supabase
      .from('whatsapp_chats')
      .select('chat_id, contact_phone, contact_name')
      .eq('company_id', companyId)
      .is('contact_avatar', null)
      .limit(5);
    
    if (!chatsWithoutAvatar || chatsWithoutAvatar.length === 0) {
      console.log('✅ Todos os chats já têm avatar ou não há chats');
      return;
    }
    
    console.log(`📱 Encontrados ${chatsWithoutAvatar.length} chats sem avatar:`);
    chatsWithoutAvatar.forEach(chat => {
      console.log(`  - ${chat.contact_name || 'Sem nome'} (${chat.contact_phone})`);
    });
    
    // Chamar função de sincronização
    const phoneNumbers = chatsWithoutAvatar.map(chat => 
      chat.contact_phone.replace(/\D/g, '')
    );
    
    console.log('🔄 Chamando função de sincronização...');
    const { data, error } = await supabase.functions.invoke('sync-contact-avatars', {
      body: {
        company_id: companyId,
        phone_numbers: phoneNumbers
      }
    });
    
    if (error) {
      console.error('❌ Erro na sincronização:', error);
      return;
    }
    
    console.log('✅ Resultado da sincronização:', data);
    
    // Verificar se os avatares foram atualizados
    const { data: updatedChats } = await supabase
      .from('whatsapp_chats')
      .select('chat_id, contact_name, contact_phone, contact_avatar')
      .eq('company_id', companyId)
      .in('chat_id', chatsWithoutAvatar.map(c => c.chat_id));
    
    console.log('📸 Status dos avatares após sincronização:');
    updatedChats?.forEach(chat => {
      const hasAvatar = chat.contact_avatar ? '✅' : '❌';
      console.log(`  ${hasAvatar} ${chat.contact_name || 'Sem nome'} (${chat.contact_phone})`);
      if (chat.contact_avatar) {
        console.log(`    Avatar: ${chat.contact_avatar}`);
      }
    });
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

// Executar teste
testSyncAvatars();
