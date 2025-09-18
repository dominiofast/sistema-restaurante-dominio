// Script para atualizar usuário superadmin contato@dominio.tech
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://epqppxteicfuzdblbluq.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA5NjA2MCwiZXhwIjoyMDY1NjcyMDYwfQ.Iskwd4R2xwTSEr3ao07FxTn8ba51FnyTg4UJravf9Pc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateSuperadmin() {
  try {
    console.log('🔄 Atualizando usuário superadmin contato@dominio.tech...');

    // Buscar o usuário existente
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao buscar usuários:', listError);
      return;
    }

    const user = users.users.find(u => u.email === 'contato@dominio.tech');
    
    if (!user) {
      console.error('❌ Usuário não encontrado');
      return;
    }

    console.log('👤 Usuário encontrado:');
    console.log('📧 Email:', user.email);
    console.log('🆔 ID:', user.id);
    console.log('👑 Super Admin atual:', user.is_super_admin);
    console.log('📝 Metadata atual:', user.user_metadata);

    // Atualizar para super admin
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        user_metadata: {
          name: 'Super Admin',
          role: 'super_admin',
          company_domain: 'sistema',
          company_id: null
        }
      }
    );

    if (updateError) {
      console.error('❌ Erro ao atualizar usuário:', updateError);
      return;
    }

    console.log('✅ Usuário atualizado com sucesso!');
    console.log('📧 Email:', updatedUser.user.email);
    console.log('🆔 ID:', updatedUser.user.id);
    console.log('👑 Super Admin:', updatedUser.user.is_super_admin);
    console.log('📝 Nova metadata:', updatedUser.user.user_metadata);

    // Verificar se precisa redefinir senha
    console.log('\n🔑 Para redefinir a senha, use:');
    console.log('📧 Email: contato@dominio.tech');
    console.log('🔑 Senha atual: (use a funcionalidade de reset de senha)');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

updateSuperadmin();
