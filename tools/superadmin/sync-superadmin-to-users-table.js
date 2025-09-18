// Script para sincronizar superadmin do auth.users para a tabela users
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://epqppxteicfuzdblbluq.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA5NjA2MCwiZXhwIjoyMDY1NjcyMDYwfQ.Iskwd4R2xwTSEr3ao07FxTn8ba51FnyTg4UJravf9Pc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function syncSuperadminToUsersTable() {
  try {
    console.log('🔄 Sincronizando superadmin do auth.users para a tabela users...');

    // 1. Buscar o usuário no auth.users
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao buscar usuários:', listError);
      return;
    }

    const authUser = users.users.find(u => u.email === 'contato@dominio.tech');
    
    if (!authUser) {
      console.error('❌ Usuário não encontrado no auth.users');
      return;
    }

    console.log('✅ Usuário encontrado no auth.users:');
    console.log('📧 Email:', authUser.email);
    console.log('🆔 ID:', authUser.id);
    console.log('📝 Metadata:', authUser.user_metadata);

    // 2. Verificar se já existe na tabela users
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'contato@dominio.tech')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar usuário existente:', checkError);
      return;
    }

    if (existingUser) {
      console.log('⚠️ Usuário já existe na tabela users:', existingUser);
      return;
    }

    // 3. Inserir na tabela users
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || 'Super Admin',
        role: authUser.user_metadata?.role || 'super_admin',
        password: 'managed_by_auth', // Senha gerenciada pelo Supabase Auth
        created_at: authUser.created_at,
        updated_at: authUser.updated_at
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao inserir na tabela users:', insertError);
      return;
    }

    console.log('✅ Usuário sincronizado com sucesso!');
    console.log('📧 Email:', newUser.email);
    console.log('🆔 ID:', newUser.id);
    console.log('👑 Role:', newUser.role);
    console.log('📅 Criado em:', newUser.created_at);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

syncSuperadminToUsersTable();

