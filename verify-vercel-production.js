// Script para verificar se o superadmin está no banco de produção do Vercel
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configurar WebSocket para Neon DB
neonConfig.webSocketConstructor = ws;

async function verifyVercelProduction() {
  try {
    console.log('🔍 Verificando superadmin no banco de produção do Vercel...');

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL não configurada');
      console.log('💡 Este script deve ser executado no ambiente do Vercel onde a DATABASE_URL de produção está configurada');
      return;
    }

    // Mascarar URL para segurança
    const maskedUrl = process.env.DATABASE_URL.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1***$2');
    console.log('🔍 DATABASE_URL de produção:', maskedUrl);

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Verificar informações do banco
    const diagQuery = 'SELECT current_database() as db, current_user as user, current_schema() as schema, version() as version';
    const diagResult = await pool.query(diagQuery);
    console.log('🔍 Informações do banco de produção:', diagResult.rows[0]);

    // Verificar se existe superadmin
    const superadminQuery = `SELECT id, email, name, role, created_at, updated_at FROM users WHERE email = 'contato@dominio.tech'`;
    const superadminResult = await pool.query(superadminQuery);

    if (superadminResult.rows.length > 0) {
      console.log('✅ Superadmin encontrado no banco de produção:');
      console.log(JSON.stringify(superadminResult.rows[0], null, 2));
    } else {
      console.log('❌ Superadmin NÃO encontrado no banco de produção');
      
      // Criar superadmin
      console.log('🚀 Criando superadmin no banco de produção...');
      const createQuery = `
        INSERT INTO users (id, email, name, role, password, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
        RETURNING id, email, name, role, created_at
      `;
      
      const userId = 'b27c24b1-6c54-4ba1-8998-d340fb2286e3';
      const result = await pool.query(createQuery, [
        userId,
        'contato@dominio.tech',
        'Super Admin',
        'super_admin',
        '$2b$12$4oSZ5n71CDm/rytk1RgTLOvg3ktRXjOjsYBU5XAY8th0tsUFACMZ6'
      ]);

      console.log('✅ Superadmin criado com sucesso no banco de produção:', result.rows[0]);
    }

    // Listar todos os usuários
    const allUsersQuery = `SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC`;
    const allUsersResult = await pool.query(allUsersQuery);
    console.log(`\n📊 Total de usuários no banco de produção: ${allUsersResult.rows.length}`);
    
    if (allUsersResult.rows.length > 0) {
      console.log('👥 Usuários encontrados:');
      allUsersResult.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.role}) - ${user.created_at}`);
      });
    }

    await pool.end();

  } catch (error) {
    console.error('❌ Erro ao verificar banco de produção:', error);
  }
}

verifyVercelProduction();
