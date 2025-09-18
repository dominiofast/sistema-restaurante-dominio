// API para verificar se as tabelas do cardápio existem no Neon
import { Pool } from '@neondatabase/serverless';

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
    console.log('🔍 Verificando tabelas do cardápio no Neon...');

    // Lista de tabelas do cardápio que devem existir
    const cardapioTables = [
      'produtos',
      'categorias', 
      'categorias_adicionais',
      'adicionais',
      'produto_categorias_adicionais',
      'cardapio_branding'
    ];

    const results = {};

    // Verificar cada tabela
    for (const tableName of cardapioTables) {
      try {
        const query = `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          ) as exists;
        `;
        
        const result = await pool.query(query, [tableName]);
        results[tableName] = result.rows[0].exists;
        
        console.log(`📋 Tabela ${tableName}: ${result.rows[0].exists ? '✅ Existe' : '❌ Não existe'}`);
      } catch (error) {
        console.error(`❌ Erro ao verificar tabela ${tableName}:`, error);
        results[tableName] = false;
      }
    }

    // Verificar se existem dados nas tabelas
    const dataCounts = {};
    
    for (const tableName of cardapioTables) {
      if (results[tableName]) {
        try {
          const countQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
          const countResult = await pool.query(countQuery);
          dataCounts[tableName] = parseInt(countResult.rows[0].count);
          console.log(`📊 ${tableName}: ${dataCounts[tableName]} registros`);
        } catch (error) {
          console.error(`❌ Erro ao contar registros em ${tableName}:`, error);
          dataCounts[tableName] = 0;
        }
      }
    }

    // Verificar estrutura da tabela produtos
    let produtosStructure = null;
    if (results.produtos) {
      try {
        const structureQuery = `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'produtos' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `;
        const structureResult = await pool.query(structureQuery);
        produtosStructure = structureResult.rows;
        console.log('🏗️ Estrutura da tabela produtos:', produtosStructure.length, 'colunas');
      } catch (error) {
        console.error('❌ Erro ao verificar estrutura da tabela produtos:', error);
      }
    }

    // Verificar se há empresas cadastradas
    let companiesCount = 0;
    try {
      const companiesQuery = 'SELECT COUNT(*) as count FROM companies';
      const companiesResult = await pool.query(companiesQuery);
      companiesCount = parseInt(companiesResult.rows[0].count);
      console.log(`🏢 Empresas cadastradas: ${companiesCount}`);
    } catch (error) {
      console.error('❌ Erro ao verificar empresas:', error);
    }

    const allTablesExist = Object.values(results).every(exists => exists);
    const hasData = Object.values(dataCounts).some(count => count > 0);

    console.log(`\n📋 RESUMO:`);
    console.log(`✅ Todas as tabelas existem: ${allTablesExist}`);
    console.log(`📊 Tem dados: ${hasData}`);
    console.log(`🏢 Empresas: ${companiesCount}`);

    return res.status(200).json({
      success: true,
      message: 'Verificação das tabelas do cardápio concluída',
      tables: results,
      dataCounts,
      produtosStructure,
      companiesCount,
      allTablesExist,
      hasData,
      summary: {
        totalTables: cardapioTables.length,
        existingTables: Object.values(results).filter(exists => exists).length,
        tablesWithData: Object.values(dataCounts).filter(count => count > 0).length,
        totalRecords: Object.values(dataCounts).reduce((sum, count) => sum + count, 0)
      }
    });

  } catch (error) {
    console.error('💥 Erro ao verificar tabelas do cardápio:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  } finally {
    await pool.end();
  }
}

