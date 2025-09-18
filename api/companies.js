// API para buscar empresas do Neon PostgreSQL
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

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido'
    });
  }

  console.log('🏢 API /companies - Buscando empresas...');

  try {
    // Verificar se DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL não configurada');
      return res.status(500).json({
        success: false,
        error: 'Erro de configuração do banco de dados'
      });
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Buscar todas as empresas ativas
    const query = `
      SELECT 
        id,
        name,
        domain,
        logo,
        plan,
        status,
        user_count,
        store_code,
        slug,
        created_at,
        updated_at
      FROM companies 
      WHERE status = 'active'
      ORDER BY name ASC
    `;

    const result = await pool.query(query);
    await pool.end();

    console.log(`✅ Encontradas ${result.rows.length} empresas ativas`);

    return res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('💥 API /companies - Erro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar empresas',
      details: error.message
    });
  }
}
