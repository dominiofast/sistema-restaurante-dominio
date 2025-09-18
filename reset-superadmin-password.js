// Script para redefinir senha do usuário superadmin contato@dominio.tech
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://epqppxteicfuzdblbluq.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA5NjA2MCwiZXhwIjoyMDY1NjcyMDYwfQ.Iskwd4R2xwTSEr3ao07FxTn8ba51FnyTg4UJravf9Pc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetSuperadminPassword() {
  try {
    console.log('🔑 Redefinindo senha do usuário superadmin contato@dominio.tech...');

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

    console.log('👤 Usuário encontrado:', user.email);

    // Redefinir senha
    const newPassword = 'SuperAdmin2024!';
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        password: newPassword
      }
    );

    if (updateError) {
      console.error('❌ Erro ao redefinir senha:', updateError);
      return;
    }

    console.log('✅ Senha redefinida com sucesso!');
    console.log('📧 Email:', updatedUser.user.email);
    console.log('🔑 Nova senha:', newPassword);
    console.log('👑 Role:', updatedUser.user.user_metadata?.role);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

resetSuperadminPassword();
