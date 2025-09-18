// API para gerenciar tipos fiscais no Neon PostgreSQL
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
      // BUSCAR TIPOS FISCAIS
      console.log('🏷️  API /tipos-fiscais GET - Buscando tipos fiscais...');

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
          company_id,
          nome,
          descricao,
          ativo,
          created_at,
          updated_at
        FROM tipos_fiscais 
        WHERE company_id = $1 AND ativo = true
        ORDER BY nome ASC
      `;

      const result = await pool.query(query, [company_id]);
      
      console.log(`✅ Encontrados ${result.rows.length} tipos fiscais para empresa ${company_id}`);

      return res.status(200).json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });

    } else if (req.method === 'POST') {
      // CRIAR TIPO FISCAL
      console.log('🏷️  API /tipos-fiscais POST - Criando tipo fiscal...');
      
      const { company_id, nome, descricao, ativo } = req.body;

      if (!company_id || !nome) {
        return res.status(400).json({
          success: false,
          error: 'company_id e nome são obrigatórios'
        });
      }

      // Verificar se já existe tipo fiscal com mesmo nome para a empresa
      const checkQuery = 'SELECT id FROM tipos_fiscais WHERE company_id = $1 AND nome = $2';
      const checkResult = await pool.query(checkQuery, [company_id, nome]);

      if (checkResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Já existe um tipo fiscal com este nome para esta empresa'
        });
      }

      const insertQuery = `
        INSERT INTO tipos_fiscais (company_id, nome, descricao, ativo, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `;

      const result = await pool.query(insertQuery, [
        company_id,
        nome,
        descricao || null,
        ativo !== false // default true
      ]);

      console.log('✅ Tipo fiscal criado:', result.rows[0].nome);

      return res.status(201).json({
        success: true,
        data: result.rows[0]
      });

    } else if (req.method === 'PUT') {
      // ATUALIZAR TIPO FISCAL
      console.log('🏷️  API /tipos-fiscais PUT - Atualizando tipo fiscal...');
      
      const { id, nome, descricao, ativo } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID é obrigatório'
        });
      }

      const updateQuery = `
        UPDATE tipos_fiscais 
        SET nome = COALESCE($2, nome),
            descricao = COALESCE($3, descricao),
            ativo = COALESCE($4, ativo),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [
        id,
        nome || null,
        descricao || null,
        ativo !== undefined ? ativo : null
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipo fiscal não encontrado'
        });
      }

      console.log('✅ Tipo fiscal atualizado:', result.rows[0].nome);

      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });

    } else if (req.method === 'DELETE') {
      // DELETAR TIPO FISCAL
      console.log('🏷️  API /tipos-fiscais DELETE - Deletando tipo fiscal...');
      
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID é obrigatório'
        });
      }

      // Em vez de deletar, marcar como inativo
      const updateQuery = `
        UPDATE tipos_fiscais 
        SET ativo = false, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipo fiscal não encontrado'
        });
      }

      console.log('✅ Tipo fiscal desativado:', result.rows[0].nome);

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
    console.error('💥 API /tipos-fiscais - Erro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  } finally {
    await pool.end();
  }
}