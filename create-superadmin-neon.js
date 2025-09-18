// Script para criar superadmin no Neon DB
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configurar WebSocket para Neon DB
neonConfig.webSocketConstructor = ws;

async function createSuperadminInNeon() {
  try {
    console.log('🚀 Criando superadmin no Neon DB...');

    // Verificar se DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL não configurada');
      console.log('💡 Configure a variável DATABASE_URL com a string de conexão do Neon DB');
      return;
    }

    // Criar conexão com Neon DB
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Verificar conexão
    const diagQuery = 'SELECT current_database() as db, current_user as user, current_schema() as schema';
    const diagResult = await pool.query(diagQuery);
    console.log('🔍 Conectado ao banco:', diagResult.rows[0]);

    // Verificar se já existe um superadmin
    const existingQuery = `SELECT id, email, role, created_at FROM users WHERE email = 'contato@dominio.tech'`;
    const existingResult = await pool.query(existingQuery);

    if (existingResult.rows.length > 0) {
      console.log('✅ Superadmin já existe no Neon DB:', existingResult.rows[0]);
      await pool.end();
      return;
    }

    // Criar superadmin
    const createQuery = `
      INSERT INTO users (id, email, name, role, password, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
      RETURNING id, email, name, role, created_at
    `;
    
    const userId = 'b27c24b1-6c54-4ba1-8998-d340fb2286e3'; // Mesmo ID do Supabase Auth
    const result = await pool.query(createQuery, [
      userId,
      'contato@dominio.tech',
      'Super Admin',
      'super_admin',
      '$2b$12$4oSZ5n71CDm/rytk1RgTLOvg3ktRXjOjsYBU5XAY8th0tsUFACMZ6' // Hash para 'SuperAdmin2024!'
    ]);

    console.log('✅ Superadmin criado com sucesso no Neon DB:', result.rows[0]);

    // Verificar se foi criado
    const verifyQuery = `SELECT * FROM users WHERE email = 'contato@dominio.tech'`;
    const verifyResult = await pool.query(verifyQuery);
    console.log('🔍 Verificação - Usuário encontrado:', verifyResult.rows[0]);

    await pool.end();

  } catch (error) {
    console.error('❌ Erro ao criar superadmin no Neon DB:', error);
  }
}

createSuperadminInNeon();
