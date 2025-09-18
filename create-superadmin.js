// Script para criar usuário superadmin contato@dominio.tech
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://epqppxteicfuzdblbluq.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA5NjA2MCwiZXhwIjoyMDY1NjcyMDYwfQ.Iskwd4R2xwTSEr3ao07FxTn8ba51FnyTg4UJravf9Pc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSuperadmin() {
  try {
    console.log('🚀 Criando usuário superadmin contato@dominio.tech...');

    // Verificar se o usuário já existe
    const { data: existingUsers, error: checkError } = await supabase.auth.admin.listUsers();
    
    if (checkError) {
      console.error('❌ Erro ao verificar usuários existentes:', checkError);
      return;
    }

    const existingUser = existingUsers.users.find(user => user.email === 'contato@dominio.tech');
    
    if (existingUser) {
      console.log('⚠️ Usuário já existe:', existingUser.email);
      console.log('📧 Email:', existingUser.email);
      console.log('🆔 ID:', existingUser.id);
      console.log('👑 Super Admin:', existingUser.is_super_admin);
      return;
    }

    // Criar o usuário superadmin
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'contato@dominio.tech',
      password: 'SuperAdmin2024!',
      email_confirm: true,
      user_metadata: {
        name: 'Super Admin',
        role: 'super_admin',
        company_domain: 'sistema',
        company_id: null
      }
    });

    if (createError) {
      console.error('❌ Erro ao criar usuário:', createError);
      return;
    }

    console.log('✅ Usuário superadmin criado com sucesso!');
    console.log('📧 Email:', newUser.user.email);
    console.log('🆔 ID:', newUser.user.id);
    console.log('🔑 Senha: SuperAdmin2024!');
    console.log('👑 Super Admin:', newUser.user.is_super_admin);

    // Atualizar para super admin
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      newUser.user.id,
      { 
        user_metadata: {
          ...newUser.user.user_metadata,
          role: 'super_admin'
        }
      }
    );

    if (updateError) {
      console.warn('⚠️ Aviso ao atualizar metadata:', updateError);
    } else {
      console.log('✅ Metadata atualizada para super_admin');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createSuperadmin();
