// ENDPOINT SERVERLESS PARA CRIAR SUPERADMIN NA VERCEL
// Funciona automaticamente com a DATABASE_URL configurada na Vercel

import { Pool } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed - Use POST' });
  }

  console.log('👑 API /create-superadmin - Criando superadmin na produção');

  try {
    // Verificar se DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_URL não configurada'
      });
    }

    // Criar conexão com PostgreSQL
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Verificar se já existe um superadmin
    const existingQuery = `SELECT id, email, role, created_at FROM users WHERE email = 'contato@dominio.tech'`;
    const existingResult = await pool.query(existingQuery);

    if (existingResult.rows.length > 0) {
      console.log('✅ Superadmin já existe:', existingResult.rows[0]);
      return res.json({
        success: true,
        message: 'Superadmin já existe no banco de produção',
        user: existingResult.rows[0]
      });
    }

    // Criar superadmin
    const createQuery = `
      INSERT INTO users (email, name, role, password, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, NOW(), NOW()) 
      RETURNING id, email, name, role, created_at
    `;
    
    const result = await pool.query(createQuery, [
      'contato@dominio.tech',
      'Super Admin',
      'super_admin',
      '$2b$12$4oSZ5n71CDm/rytk1RgTLOvg3ktRXjOjsYBU5XAY8th0tsUFACMZ6'
    ]);

    console.log('✅ Superadmin criado com sucesso na produção:', result.rows[0]);

    res.json({
      success: true,
      message: 'Superadmin criado com sucesso na produção!',
      user: result.rows[0],
      credentials: {
        email: 'contato@dominio.tech',
        password: 'Admin123!@#',
        note: 'Use essas credenciais para fazer login'
      }
    });

    // Fechar conexão
    await pool.end();

  } catch (error) {
    console.error('💥 API /create-superadmin - Erro na produção:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Erro ao criar superadmin na produção'
    });
  }
}