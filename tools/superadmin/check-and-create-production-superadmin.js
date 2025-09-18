// Script para verificar e criar superadmin no banco de produção
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configurar WebSocket para Neon DB
neonConfig.webSocketConstructor = ws;

async function checkAndCreateProductionSuperadmin() {
  try {
    console.log('🔍 Verificando banco atual e criando superadmin...');

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL não configurada');
      return;
    }

    // Mascarar URL para segurança
    const maskedUrl = process.env.DATABASE_URL.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1***$2');
    console.log('🔍 DATABASE_URL mascarada:', maskedUrl);

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Verificar informações do banco
    const diagQuery = 'SELECT current_database() as db, current_user as user, current_schema() as schema, version() as version';
    const diagResult = await pool.query(diagQuery);
    console.log('🔍 Informações do banco:', diagResult.rows[0]);

    // Verificar se já existe superadmin
    const existingQuery = `SELECT id, email, role, created_at FROM users WHERE email = 'contato@dominio.tech'`;
    const existingResult = await pool.query(existingQuery);

    if (existingResult.rows.length > 0) {
      console.log('✅ Superadmin já existe no banco atual:');
      console.log(JSON.stringify(existingResult.rows[0], null, 2));
      
      // Verificar se é o banco de produção
      const dbName = diagResult.rows[0].db;
      if (dbName.includes('prod') || dbName.includes('production')) {
        console.log('🎉 Este é o banco de PRODUÇÃO e o superadmin já existe!');
      } else {
        console.log('⚠️ Este parece ser o banco de DESENVOLVIMENTO');
        console.log('💡 Para criar no banco de produção, configure a DATABASE_URL de produção');
      }
    } else {
      console.log('❌ Superadmin não encontrado no banco atual');
      
      // Criar superadmin
      console.log('🚀 Criando superadmin...');
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

      console.log('✅ Superadmin criado com sucesso:', result.rows[0]);
    }

    // Listar todos os usuários
    const allUsersQuery = `SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC`;
    const allUsersResult = await pool.query(allUsersQuery);
    console.log(`\n📊 Total de usuários no banco: ${allUsersResult.rows.length}`);
    
    if (allUsersResult.rows.length > 0) {
      console.log('👥 Usuários encontrados:');
      allUsersResult.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.role}) - ${user.created_at}`);
      });
    }

    await pool.end();

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkAndCreateProductionSuperadmin();

