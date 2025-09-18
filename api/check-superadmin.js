// API para verificar e criar superadmin no Vercel
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configurar WebSocket para Neon DB
neonConfig.webSocketConstructor = ws;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🔍 Verificando superadmin no Vercel...');

    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_URL não configurada no Vercel'
      });
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Verificar informações do banco
    const diagQuery = 'SELECT current_database() as db, current_user as user, current_schema() as schema';
    const diagResult = await pool.query(diagQuery);
    console.log('🔍 Banco conectado:', diagResult.rows[0]);

    // Verificar se existe superadmin
    const superadminQuery = `SELECT id, email, name, role, created_at FROM users WHERE email = 'contato@dominio.tech'`;
    const superadminResult = await pool.query(superadminQuery);

    if (superadminResult.rows.length > 0) {
      console.log('✅ Superadmin encontrado no Vercel');
      await pool.end();
      
      return res.json({
        success: true,
        message: 'Superadmin já existe no banco de produção',
        user: superadminResult.rows[0],
        database_info: diagResult.rows[0]
      });
    }

    // Criar superadmin
    console.log('🚀 Criando superadmin no Vercel...');
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

    console.log('✅ Superadmin criado no Vercel:', result.rows[0]);

    // Listar todos os usuários
    const allUsersQuery = `SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC`;
    const allUsersResult = await pool.query(allUsersQuery);

    await pool.end();

    res.json({
      success: true,
      message: 'Superadmin criado com sucesso no banco de produção!',
      user: result.rows[0],
      all_users: allUsersResult.rows,
      database_info: diagResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Erro no Vercel:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Erro ao verificar/criar superadmin no Vercel'
    });
  }
}
