// Script para verificar usuários no Neon DB
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configurar WebSocket para Neon DB
neonConfig.webSocketConstructor = ws;

async function verifyNeonUsers() {
  try {
    console.log('🔍 Verificando usuários no Neon DB...');

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL não configurada');
      return;
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Verificar todos os usuários
    const usersQuery = `SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC`;
    const usersResult = await pool.query(usersQuery);

    console.log(`📊 Total de usuários encontrados: ${usersResult.rows.length}`);
    
    if (usersResult.rows.length > 0) {
      console.log('\n👥 Usuários no Neon DB:');
      usersResult.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.role}) - ID: ${user.id}`);
      });
    } else {
      console.log('❌ Nenhum usuário encontrado na tabela users');
    }

    // Verificar especificamente o superadmin
    const superadminQuery = `SELECT * FROM users WHERE email = 'contato@dominio.tech'`;
    const superadminResult = await pool.query(superadminQuery);

    if (superadminResult.rows.length > 0) {
      console.log('\n✅ Superadmin encontrado:');
      console.log(JSON.stringify(superadminResult.rows[0], null, 2));
    } else {
      console.log('\n❌ Superadmin não encontrado');
    }

    await pool.end();

  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  }
}

verifyNeonUsers();
