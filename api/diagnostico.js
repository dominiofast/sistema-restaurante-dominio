// DIAGNÓSTICO COMPLETO DO BANCO DE PRODUÇÃO
import { Pool } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // 1. Informações do banco
    const dbInfo = await pool.query('SELECT current_database() as db, current_user as user, current_schema() as schema, version() as version');

    // 2. Verificar se tabela users existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as exists
    `);

    // 3. Estrutura da tabela users (se existir)
    let tableStructure = null;
    if (tableExists.rows[0].exists) {
      tableStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
        ORDER BY ordinal_position
      `);
    }

    // 4. Listar todos os usuários (se tabela existir)
    let allUsers = null;
    if (tableExists.rows[0].exists) {
      allUsers = await pool.query('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT 10');
    }

    // 5. Todas as tabelas no schema public
    const allTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    await pool.end();

    res.json({
      success: true,
      database_info: dbInfo.rows[0],
      table_users_exists: tableExists.rows[0].exists,
      table_structure: tableStructure?.rows || null,
      all_users: allUsers?.rows || null,
      all_tables: allTables.rows.map(t => t.table_name),
      database_url_masked: process.env.DATABASE_URL?.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1***$2')
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      database_url_masked: process.env.DATABASE_URL?.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1***$2')
    });
  }
}