// API básica para produtos no Neon PostgreSQL
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configurar WebSocket para Neon
neonConfig.webSocketConstructor = ws;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verificar se DATABASE_URL está configurada
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não configurada');
    return res.status(500).json({
      success: false,
      error: 'Erro de configuração do banco de dados'
    });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    if (req.method === 'GET') {
      // BUSCAR PRODUTOS
      console.log('🛍️ API /produtos GET - Buscando produtos...');

      const { company_id } = req.query;

      if (!company_id) {
        return res.status(400).json({
          success: false,
          error: 'company_id é obrigatório'
        });
      }

      const query = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price,
          p.promotional_price,
          p.is_promotional,
          p.image,
          p.images,
          p.categoria_id,
          p.is_available,
          p.preparation_time,
          p.ingredients,
          p.destaque,
          p.order_position,
          p.company_id,
          p.tipo_fiscal_id,
          p.created_at,
          p.updated_at,
          c.name as categoria_name
        FROM produtos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.company_id = $1 AND p.is_available = true
        ORDER BY p.order_position ASC NULLS LAST, p.name ASC
      `;

      const result = await pool.query(query, [company_id]);
      
      console.log(`✅ Encontrados ${result.rows.length} produtos para empresa ${company_id}`);

      // Formar o resultado no formato esperado pelo frontend
      const produtos = result.rows.map(row => ({
        ...row,
        // Garantir que valores monetários sejam números
        price: parseFloat(row.price) || 0,
        promotional_price: row.promotional_price ? parseFloat(row.promotional_price) : null,
        is_promotional: Boolean(row.is_promotional),
        is_available: Boolean(row.is_available),
        destaque: Boolean(row.destaque),
        order_position: parseInt(row.order_position) || 0,
        preparation_time: row.preparation_time ? parseInt(row.preparation_time) : null,
        categorias: row.categoria_name ? { 
          id: row.categoria_id, 
          name: row.categoria_name 
        } : null
      }));

      return res.status(200).json({
        success: true,
        data: produtos,
        count: produtos.length
      });

    } else {
      return res.status(405).json({
        success: false,
        error: 'Método não implementado ainda - use apenas GET por enquanto'
      });
    }

  } catch (error) {
    console.error('💥 API /produtos - Erro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  } finally {
    await pool.end();
  }
}
