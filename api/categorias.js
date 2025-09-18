// API para gerenciar categorias no Neon PostgreSQL
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
      // BUSCAR CATEGORIAS
      console.log('🏷️ API /categorias GET - Buscando categorias...');

      const { company_id } = req.query;

      if (!company_id) {
        return res.status(400).json({
          success: false,
          error: 'company_id é obrigatório'
        });
      }

      const query = `
        SELECT 
          id,
          name,
          description,
          image,
          order_position,
          is_active,
          company_id,
          created_at,
          updated_at
        FROM categorias 
        WHERE company_id = $1 AND is_active = true
        ORDER BY order_position ASC, name ASC
      `;

      const result = await pool.query(query, [company_id]);
      
      console.log(`✅ Encontradas ${result.rows.length} categorias para empresa ${company_id}`);

      return res.status(200).json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });

    } else if (req.method === 'POST') {
      // CRIAR CATEGORIA
      console.log('🏷️ API /categorias POST - Criando categoria...');
      
      const { company_id, name, description, image, order_position, is_active } = req.body;

      if (!company_id || !name) {
        return res.status(400).json({
          success: false,
          error: 'company_id e name são obrigatórios'
        });
      }

      // Verificar se já existe categoria com mesmo nome para a empresa
      const checkQuery = 'SELECT id FROM categorias WHERE company_id = $1 AND name = $2';
      const checkResult = await pool.query(checkQuery, [company_id, name]);

      if (checkResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Já existe uma categoria com este nome para esta empresa'
        });
      }

      const insertQuery = `
        INSERT INTO categorias (
          company_id, 
          name, 
          description, 
          image, 
          order_position, 
          is_active, 
          created_at, 
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      `;

      const result = await pool.query(insertQuery, [
        company_id,
        name,
        description || null,
        image || null,
        order_position || 0,
        is_active !== false // default true
      ]);

      console.log('✅ Categoria criada:', result.rows[0].name);

      return res.status(201).json({
        success: true,
        data: result.rows[0]
      });

    } else if (req.method === 'PUT') {
      // ATUALIZAR CATEGORIA
      console.log('🏷️ API /categorias PUT - Atualizando categoria...');
      
      const { id, name, description, image, order_position, is_active } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID é obrigatório'
        });
      }

      const updateQuery = `
        UPDATE categorias 
        SET name = COALESCE($2, name),
            description = COALESCE($3, description),
            image = COALESCE($4, image),
            order_position = COALESCE($5, order_position),
            is_active = COALESCE($6, is_active),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [
        id,
        name || null,
        description || null,
        image || null,
        order_position !== undefined ? order_position : null,
        is_active !== undefined ? is_active : null
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Categoria não encontrada'
        });
      }

      console.log('✅ Categoria atualizada:', result.rows[0].name);

      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });

    } else if (req.method === 'DELETE') {
      // DELETAR CATEGORIA
      console.log('🏷️ API /categorias DELETE - Deletando categoria...');
      
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID é obrigatório'
        });
      }

      // Marcar como inativo em vez de deletar
      const updateQuery = `
        UPDATE categorias 
        SET is_active = false, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Categoria não encontrada'
        });
      }

      console.log('✅ Categoria desativada:', result.rows[0].name);

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
    console.error('💥 API /categorias - Erro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  } finally {
    await pool.end();
  }
}
