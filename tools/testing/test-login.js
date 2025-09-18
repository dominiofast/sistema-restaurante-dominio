// Script para testar o login do superadmin
import { authenticateUser } from './server/db.js';

async function testLogin() {
  try {
    console.log('🔐 Testando login do superadmin...');

    const email = 'contato@dominio.tech';
    const password = 'Admin123!@#';

    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);

    const user = await authenticateUser(email, password);

    if (user) {
      console.log('✅ Login bem-sucedido!');
      console.log('👤 Usuário:', JSON.stringify(user, null, 2));
    } else {
      console.log('❌ Login falhou - credenciais inválidas');
    }

  } catch (error) {
    console.error('❌ Erro no teste de login:', error);
  }
}

testLogin();
