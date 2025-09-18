// API para gerenciar categorias adicionais no Neon PostgreSQL
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
      const { company_id } = req.query;
      
      if (!company_id) {
        return res.status(400).json({
          success: false,
          error: 'company_id é obrigatório'
        });
      }

      console.log('🏷️ API /categorias-adicionais GET - Buscando categorias adicionais para empresa:', company_id);
      
      const query = `
        SELECT 
          id, 
          company_id, 
          name, 
          description, 
          selection_type, 
          is_required, 
          min_selection, 
          max_selection,
          order_position,
          created_at, 
          updated_at
        FROM categorias_adicionais 
        WHERE company_id = $1
        ORDER BY order_position ASC NULLS LAST, name ASC
      `;
      
      const result = await pool.query(query, [company_id]);
      
      console.log(`✅ Encontradas ${result.rows.length} categorias adicionais para empresa ${company_id}`);

      // Garantir tipos corretos nos dados retornados
      const categoriasAdicionais = result.rows.map(row => ({
        ...row,
        is_required: Boolean(row.is_required),
        min_selection: parseInt(row.min_selection) || 0,
        max_selection: row.max_selection ? parseInt(row.max_selection) : null,
        order_position: parseInt(row.order_position) || 0
      }));

      return res.status(200).json({
        success: true,
        data: categoriasAdicionais,
        count: categoriasAdicionais.length
      });

    } else if (req.method === 'POST') {
      console.log('🏷️ API /categorias-adicionais POST - Criando categoria adicional...');
      
      const { 
        company_id, 
        name, 
        description, 
        selection_type, 
        is_required, 
        min_selection, 
        max_selection,
        order_position
      } = req.body;
      
      if (!company_id || !name) {
        return res.status(400).json({
          success: false,
          error: 'company_id e name são obrigatórios'
        });
      }

      const insertQuery = `
        INSERT INTO categorias_adicionais (
          company_id, 
          name, 
          description, 
          selection_type, 
          is_required, 
          min_selection, 
          max_selection,
          order_position,
          created_at, 
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
        RETURNING *
      `;
      
      const result = await pool.query(insertQuery, [
        company_id, 
        name, 
        description || null, 
        selection_type || 'single', 
        is_required ?? false, 
        min_selection ?? 0, 
        max_selection, 
        order_position ?? 0
      ]);

      return res.status(201).json({
        success: true,
        data: result.rows[0]
      });

    } else if (req.method === 'PUT') {
      console.log('🏷️ API /categorias-adicionais PUT - Atualizando categoria adicional...');
      
      const { id, ...updates } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID da categoria adicional é obrigatório para atualização'
        });
      }

      const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
      const values = Object.values(updates);
      
      const updateQuery = `
        UPDATE categorias_adicionais 
        SET ${fields}, updated_at = NOW() 
        WHERE id = $1 
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, [id, ...values]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Categoria adicional não encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });

    } else if (req.method === 'DELETE') {
      console.log('🗑️ API /categorias-adicionais DELETE - Deletando categoria adicional...');
      
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID da categoria adicional é obrigatório'
        });
      }

      const deleteQuery = 'DELETE FROM categorias_adicionais WHERE id = $1 RETURNING *';
      const result = await pool.query(deleteQuery, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Categoria adicional não encontrada'
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
    console.error('💥 API /categorias-adicionais - Erro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  } finally {
    await pool.end();
  }
}
