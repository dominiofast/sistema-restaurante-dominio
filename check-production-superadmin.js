// Script para verificar o superadmin no banco de produção
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://epqppxteicfuzdblbluq.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA5NjA2MCwiZXhwIjoyMDY1NjcyMDYwfQ.Iskwd4R2xwTSEr3ao07FxTn8ba51FnyTg4UJravf9Pc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkProductionSuperadmin() {
  try {
    console.log('🔍 Verificando superadmin no banco de produção...');

    // Buscar o usuário no Supabase Auth (produção)
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao buscar usuários:', listError);
      return;
    }

    const user = users.users.find(u => u.email === 'contato@dominio.tech');
    
    if (!user) {
      console.error('❌ Usuário não encontrado no banco de produção');
      return;
    }

    console.log('✅ Usuário encontrado no banco de produção:');
    console.log('📧 Email:', user.email);
    console.log('🆔 ID:', user.id);
    console.log('👑 Super Admin:', user.is_super_admin);
    console.log('📝 Metadata:', user.user_metadata);
    console.log('📅 Criado em:', user.created_at);
    console.log('📅 Último login:', user.last_sign_in_at);

    // Verificar se precisa redefinir senha
    console.log('\n🔑 Para fazer login:');
    console.log('📧 Email: contato@dominio.tech');
    console.log('🔑 Senha: (use a funcionalidade de reset de senha se necessário)');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkProductionSuperadmin();
