const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    console.log('📊 API /tipos-fiscais GET - Buscando tipos fiscais...');
    
    try {
      const { company_id } = req.query;
      
      if (!company_id) {
        return res.status(400).json({ 
          success: false, 
          error: 'company_id é obrigatório' 
        });
      }

      const query = `
        SELECT * FROM tipos_fiscais 
        WHERE company_id = $1 
        ORDER BY nome
      `;
      
      const result = await pool.query(query, [company_id]);
      
      console.log(`✅ ${result.rows.length} tipos fiscais encontrados`);
      return res.status(200).json({ 
        success: true, 
        data: result.rows 
      });
      
    } catch (error) {
      console.error('❌ Erro ao buscar tipos fiscais:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }

  if (req.method === 'POST') {
    console.log('📊 API /tipos-fiscais POST - Criando tipo fiscal...');
    
    try {
      const { nome, descricao, ativo, company_id } = req.body;
      
      if (!nome || !company_id) {
        return res.status(400).json({ 
          success: false, 
          error: 'Nome e company_id são obrigatórios' 
        });
      }

      const query = `
        INSERT INTO tipos_fiscais (nome, descricao, ativo, company_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        nome, 
        descricao || null, 
        ativo ?? true, 
        company_id
      ]);
      
      console.log('✅ Tipo fiscal criado:', result.rows[0].nome);
      return res.status(201).json({ 
        success: true, 
        data: result.rows[0] 
      });
      
    } catch (error) {
      console.error('❌ Erro ao criar tipo fiscal:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }

  if (req.method === 'PUT') {
    console.log('📊 API /tipos-fiscais PUT - Atualizando tipo fiscal...');
    
    try {
      const { id, nome, descricao, ativo } = req.body;
      
      if (!id) {
        return res.status(400).json({ 
          success: false, 
          error: 'ID é obrigatório' 
        });
      }

      const query = `
        UPDATE tipos_fiscais 
        SET nome = $1, descricao = $2, ativo = $3, updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        nome, 
        descricao || null, 
        ativo ?? true, 
        id
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
      
    } catch (error) {
      console.error('❌ Erro ao atualizar tipo fiscal:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }

  if (req.method === 'DELETE') {
    console.log('📊 API /tipos-fiscais DELETE - Deletando tipo fiscal...');
    
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ 
          success: false, 
          error: 'ID é obrigatório' 
        });
      }

      const query = 'DELETE FROM tipos_fiscais WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Tipo fiscal não encontrado' 
        });
      }
      
      console.log('✅ Tipo fiscal deletado:', result.rows[0].nome);
      return res.status(200).json({ 
        success: true, 
        data: result.rows[0] 
      });
      
    } catch (error) {
      console.error('❌ Erro ao deletar tipo fiscal:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }

  return res.status(405).json({ 
    success: false, 
    error: 'Método não permitido' 
  });
}
