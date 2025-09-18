// API para gerenciar pedidos no Neon PostgreSQL
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
      const { company_id, status, limit } = req.query;
      
      if (!company_id) {
        return res.status(400).json({
          success: false,
          error: 'company_id é obrigatório'
        });
      }

      console.log('🔍 API /pedidos GET - Buscando pedidos para empresa:', company_id);
      
      let query = `
        SELECT 
          p.id,
          p.numero_pedido,
          p.company_id,
          p.nome as customer_name,
          p.telefone as customer_phone,
          p.endereco as customer_address,
          p.tipo as delivery_method,
          p.pagamento as payment_method,
          p.status,
          p.total as total_amount,
          p.observacoes as observation,
          30 as estimated_time,
          p.created_at,
          p.updated_at,
          'Empresa' as company_name
        FROM pedidos p
        WHERE p.company_id = $1
      `;
      
      let params = [company_id];
      
      if (status) {
        if (Array.isArray(status)) {
          // Múltiplos status
          const statusList = status.join("','");
          query += ` AND p.status IN ('${statusList}')`;
        } else {
          // Um status específico
          query += ` AND p.status = $${params.length + 1}`;
          params.push(status);
        }
      }
      
      query += ` ORDER BY p.created_at DESC`;
      
      if (limit) {
        query += ` LIMIT $${params.length + 1}`;
        params.push(parseInt(limit));
      }
      
      const result = await pool.query(query, params);
      
      console.log(`✅ Encontrados ${result.rows.length} pedidos para empresa ${company_id}`);

      // Garantir tipos corretos nos dados retornados
      const pedidos = result.rows.map(row => ({
        ...row,
        total_amount: parseFloat(row.total_amount) || 0,
        numero_pedido: parseInt(row.numero_pedido) || 0,
        estimated_time: row.estimated_time ? parseInt(row.estimated_time) : null
      }));

      return res.status(200).json({
        success: true,
        data: pedidos,
        count: pedidos.length
      });

    } else if (req.method === 'POST') {
      console.log('📝 API /pedidos POST - Criando pedido...');
      
      const { 
        company_id,
        customer_name,
        customer_phone,
        customer_address,
        delivery_method,
        payment_method,
        total_amount,
        observation,
        estimated_time
      } = req.body;
      
      if (!company_id || !customer_name || !total_amount) {
        return res.status(400).json({
          success: false,
          error: 'company_id, customer_name e total_amount são obrigatórios'
        });
      }

      // Gerar número do pedido único
      const numeroResult = await pool.query(
        'SELECT COALESCE(MAX(CAST(numero_pedido AS INTEGER)), 0) + 1 as next_numero FROM pedidos WHERE company_id = $1',
        [company_id]
      );
      
      const numero_pedido = numeroResult.rows[0].next_numero.toString();

      const insertQuery = `
        INSERT INTO pedidos (
          numero_pedido,
          company_id,
          nome,
          telefone,
          endereco,
          tipo,
          pagamento,
          status,
          total,
          observacoes,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) 
        RETURNING *
      `;
      
      const result = await pool.query(insertQuery, [
        numero_pedido,
        company_id,
        customer_name,
        customer_phone || null,
        customer_address || null,
        delivery_method || 'balcao',
        payment_method || 'dinheiro',
        'pendente', // status inicial
        total_amount,
        observation || null
      ]);

      console.log(`✅ Pedido #${numero_pedido} criado com sucesso`);

      return res.status(201).json({
        success: true,
        data: result.rows[0]
      });

    } else if (req.method === 'PUT') {
      console.log('🔄 API /pedidos PUT - Atualizando pedido...');
      
      const { id, ...updates } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID do pedido é obrigatório para atualização'
        });
      }

      const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
      const values = Object.values(updates);
      
      const updateQuery = `
        UPDATE pedidos 
        SET ${fields}, updated_at = NOW() 
        WHERE id = $1 
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, [id, ...values]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Pedido não encontrado'
        });
      }

      console.log(`✅ Pedido ${id} atualizado com sucesso`);

      return res.status(200).json({
        success: true,
        data: result.rows[0]
      });

    } else if (req.method === 'DELETE') {
      console.log('🗑️ API /pedidos DELETE - Deletando pedido...');
      
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID do pedido é obrigatório'
        });
      }

      const deleteQuery = 'DELETE FROM pedidos WHERE id = $1 RETURNING *';
      const result = await pool.query(deleteQuery, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Pedido não encontrado'
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
    console.error('💥 API /pedidos - Erro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  } finally {
    await pool.end();
  }
}
