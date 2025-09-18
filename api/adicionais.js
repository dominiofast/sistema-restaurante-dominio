// API para gerenciar adicionais no Neon PostgreSQL
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
      const { categoria_adicional_id, company_id } = req.query;
      
      let query = `
        SELECT 
          a.id,
          a.categoria_adicional_id,
          a.name,
          a.description,
          a.price,
          a.is_available,
          a.order_position,
          a.created_at,
          a.updated_at,
          ca.name as categoria_nome
        FROM adicionais a
        LEFT JOIN categorias_adicionais ca ON a.categoria_adicional_id = ca.id
        WHERE a.is_available = true
      `;
      
      let params = [];
      
      if (categoria_adicional_id) {
        query += ` AND a.categoria_adicional_id = $${params.length + 1}`;
        params.push(categoria_adicional_id);
      }
      
      if (company_id) {
        query += ` AND ca.company_id = $${params.length + 1}`;
        params.push(company_id);
      }
      
      query += ` ORDER BY a.order_position ASC NULLS LAST, a.name ASC`;
      
      console.log('🍕 API /adicionais GET - Buscando adicionais:', { categoria_adicional_id, company_id });
      
      const result = await pool.query(query, params);
      
      console.log(`✅ Encontrados ${result.rows.length} adicionais`);

      // Garantir tipos corretos nos dados retornados
      const adicionais = result.rows.map(row => ({
        ...row,
        price: parseFloat(row.price) || 0,
        is_available: Boolean(row.is_available),
        order_position: parseInt(row.order_position) || 0
      }));

      return res.status(200).json({
        success: true,
        data: adicionais,
        count: adicionais.length
      });

    } else if (req.method === 'POST') {
      console.log('🍕 API /adicionais POST - Criando adicional...');
      
      const { 
        categoria_adicional_id,
        name, 
        description, 
        price,
        is_available,
        order_position
      } = req.body;
      
      if (!categoria_adicional_id || !name || price === undefined) {
        return res.status(400).json({
          success: false,
          error: 'categoria_adicional_id, name e price são obrigatórios'
        });
      }

      const insertQuery = `
        INSERT INTO adicionais (
          categoria_adicional_id,
          name, 
          description, 
          price,
          is_available,
          order_position,
          created_at, 
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
        RETURNING *
      `;
      
      const result = await pool.query(insertQuery, [
        categoria_adicional_id,
        name, 
        description || null, 
        price,
        is_available ?? true,
        order_position ?? 0
      ]);

      return res.status(201).json({
        success: true,
        data: result.rows[0]
      });

    } else if (req.method === 'PUT') {
      console.log('🍕 API /adicionais PUT - Atualizando adicional...');
      
      const { id, ...updates } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID do adicional é obrigatório para atualização'
        });
      }

      const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
      const values = Object.values(updates);
      
      const updateQuery = `
        UPDATE adicionais 
        SET ${fields}, updated_at = NOW() 
        WHERE id = $1 
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, [id, ...values]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Adicional não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });

    } else if (req.method === 'DELETE') {
      console.log('🗑️ API /adicionais DELETE - Deletando adicional...');
      
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID do adicional é obrigatório'
        });
      }

      const deleteQuery = 'DELETE FROM adicionais WHERE id = $1 RETURNING *';
      const result = await pool.query(deleteQuery, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Adicional não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });

    } else {
      return res.status(405).json({
        success: false,
        error: 'Método não permitido'
      });
    }

  } catch (error) {
    console.error('💥 API /adicionais - Erro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  } finally {
    await pool.end();
  }
}
