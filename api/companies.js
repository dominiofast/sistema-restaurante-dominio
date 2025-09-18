// API para gerenciar empresas no Neon PostgreSQL
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
      // BUSCAR EMPRESAS
      console.log('🏢 API /companies GET - Buscando empresas...');

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
      
      console.log(`✅ Encontradas ${result.rows.length} empresas ativas`);

      return res.status(200).json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });

    } else if (req.method === 'POST') {
      // CRIAR EMPRESA
      console.log('🏢 API /companies POST - Criando empresa...');
      
      const { name, domain, logo, plan, status, user_count } = req.body;

      if (!name || !domain || !plan) {
        return res.status(400).json({
          success: false,
          error: 'Nome, domínio e plano são obrigatórios'
        });
      }

      // Verificar se domínio já existe
      const checkQuery = 'SELECT id FROM companies WHERE domain = $1';
      const checkResult = await pool.query(checkQuery, [domain]);

      if (checkResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Domínio já existe'
        });
      }

      // Gerar próximo store_code
      const storeCodeQuery = 'SELECT COALESCE(MAX(store_code), 999) + 1 as next_code FROM companies';
      const storeCodeResult = await pool.query(storeCodeQuery);
      const nextStoreCode = storeCodeResult.rows[0].next_code;

      // Gerar slug
      const slug = `${domain}-${nextStoreCode}`;

      const insertQuery = `
        INSERT INTO companies (name, domain, logo, plan, status, user_count, store_code, slug, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      `;

      const result = await pool.query(insertQuery, [
        name,
        domain,
        logo,
        plan,
        status || 'active',
        user_count || 1,
        nextStoreCode,
        slug
      ]);

      console.log('✅ Empresa criada:', result.rows[0].name);

      return res.status(201).json({
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
    console.error('💥 API /companies - Erro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  } finally {
    await pool.end();
  }
}