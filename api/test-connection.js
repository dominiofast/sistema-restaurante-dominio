// API de Teste de Conexão com Neon para Vercel
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configurar WebSocket para Neon
neonConfig.webSocketConstructor = ws;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('🔍 Testando conexão com Neon PostgreSQL...');

  try {
    // Verificar se DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_URL não configurada',
        details: 'Variável de ambiente DATABASE_URL não encontrada no Vercel'
      });
    }

    // Criar conexão
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Teste básico de conexão
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    
    // Verificar tabelas
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    // Verificar usuários
    const usersResult = await pool.query('SELECT email, role FROM users ORDER BY role DESC, email');

    await pool.end();

    return res.status(200).json({
      success: true,
      message: 'Conexão com Neon estabelecida com sucesso!',
      data: {
        current_time: result.rows[0].current_time,
        pg_version: result.rows[0].pg_version.split(' ')[0],
        tables_count: tablesResult.rows.length,
        tables: tablesResult.rows.map(r => r.table_name),
        users_count: usersResult.rows.length,
        users: usersResult.rows
      },
      database_url_configured: true
    });

  } catch (error) {
    console.error('❌ Erro na conexão:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erro na conexão com o banco',
      details: error.message,
      database_url_configured: !!process.env.DATABASE_URL
    });
  }
}
