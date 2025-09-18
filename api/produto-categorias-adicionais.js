// API para gerenciar relações produto-categorias adicionais no Neon PostgreSQL
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
      const { produto_id, company_id } = req.query;
      
      let query = `
        SELECT 
          pca.produto_id,
          pca.categoria_adicional_id,
          pca.is_required,
          pca.min_selection,
          pca.max_selection,
          ca.id as categoria_id,
          ca.name as categoria_name,
          ca.description as categoria_description,
          ca.selection_type,
          ca.min_selection as categoria_min_selection,
          ca.max_selection as categoria_max_selection,
          ca.is_required as categoria_is_required,
          ca.order_position as categoria_order_position
        FROM produto_categorias_adicionais pca
        INNER JOIN categorias_adicionais ca ON pca.categoria_adicional_id = ca.id
        WHERE ca.is_active = true
      `;
      
      let params = [];
      
      if (produto_id) {
        query += ` AND pca.produto_id = $${params.length + 1}`;
        params.push(produto_id);
      }
      
      if (company_id) {
        query += ` AND ca.company_id = $${params.length + 1}`;
        params.push(company_id);
      }
      
      query += ` ORDER BY ca.order_position ASC NULLS LAST, ca.name ASC`;
      
      console.log('🔗 API /produto-categorias-adicionais GET - Buscando relações:', { produto_id, company_id });
      
      const result = await pool.query(query, params);
      
      console.log(`✅ Encontradas ${result.rows.length} relações produto-categoria adicional`);

      // Transformar os dados para o formato esperado
      const relacoes = result.rows.map(row => ({
        produto_id: row.produto_id,
        categoria_adicional_id: row.categoria_adicional_id,
        is_required: Boolean(row.is_required),
        min_selection: parseInt(row.min_selection) || 0,
        max_selection: row.max_selection ? parseInt(row.max_selection) : null,
        categorias_adicionais: {
          id: row.categoria_id,
          name: row.categoria_name,
          description: row.categoria_description,
          selection_type: row.selection_type,
          min_selection: parseInt(row.categoria_min_selection) || 0,
          max_selection: row.categoria_max_selection ? parseInt(row.categoria_max_selection) : null,
          is_required: Boolean(row.categoria_is_required),
          order_position: parseInt(row.categoria_order_position) || 0
        }
      }));

      return res.status(200).json({
        success: true,
        data: relacoes,
        count: relacoes.length
      });

    } else if (req.method === 'POST') {
      console.log('🔗 API /produto-categorias-adicionais POST - Criando relação...');
      
      const { 
        produto_id,
        categoria_adicional_id, 
        is_required,
        min_selection,
        max_selection
      } = req.body;
      
      if (!produto_id || !categoria_adicional_id) {
        return res.status(400).json({
          success: false,
          error: 'produto_id e categoria_adicional_id são obrigatórios'
        });
      }

      const insertQuery = `
        INSERT INTO produto_categorias_adicionais (
          produto_id,
          categoria_adicional_id, 
          is_required,
          min_selection,
          max_selection
        ) VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
      `;
      
      const result = await pool.query(insertQuery, [
        produto_id,
        categoria_adicional_id, 
        is_required ?? false,
        min_selection ?? 0,
        max_selection
      ]);

      return res.status(201).json({
        success: true,
        data: result.rows[0]
      });

    } else if (req.method === 'PUT') {
      console.log('🔗 API /produto-categorias-adicionais PUT - Atualizando relação...');
      
      const { produto_id, categoria_adicional_id, ...updates } = req.body;
      
      if (!produto_id || !categoria_adicional_id) {
        return res.status(400).json({
          success: false,
          error: 'produto_id e categoria_adicional_id são obrigatórios para atualização'
        });
      }

      const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 3}`).join(', ');
      const values = Object.values(updates);
      
      const updateQuery = `
        UPDATE produto_categorias_adicionais 
        SET ${fields}
        WHERE produto_id = $1 AND categoria_adicional_id = $2
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, [produto_id, categoria_adicional_id, ...values]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Relação produto-categoria adicional não encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });

    } else if (req.method === 'DELETE') {
      console.log('🗑️ API /produto-categorias-adicionais DELETE - Deletando relação...');
      
      const { produto_id, categoria_adicional_id } = req.query;
      
      if (!produto_id || !categoria_adicional_id) {
        return res.status(400).json({
          success: false,
          error: 'produto_id e categoria_adicional_id são obrigatórios'
        });
      }

      const deleteQuery = `
        DELETE FROM produto_categorias_adicionais 
        WHERE produto_id = $1 AND categoria_adicional_id = $2 
        RETURNING *
      `;
      const result = await pool.query(deleteQuery, [produto_id, categoria_adicional_id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Relação produto-categoria adicional não encontrada'
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
    console.error('💥 API /produto-categorias-adicionais - Erro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  } finally {
    await pool.end();
  }
}
