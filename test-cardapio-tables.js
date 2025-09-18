// Script para testar se as tabelas do cardápio existem no Neon
import { Pool } from '@neondatabase/serverless';

async function testCardapioTables() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não configurada');
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🔍 Verificando tabelas do cardápio no Neon...\n');

    // Lista de tabelas do cardápio
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
        
        console.log(`📋 ${tableName}: ${result.rows[0].exists ? '✅ Existe' : '❌ Não existe'}`);
      } catch (error) {
        console.error(`❌ Erro ao verificar ${tableName}:`, error.message);
        results[tableName] = false;
      }
    }

    // Verificar dados
    console.log('\n📊 Verificando dados nas tabelas:');
    for (const tableName of cardapioTables) {
      if (results[tableName]) {
        try {
          const countQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
          const countResult = await pool.query(countQuery);
          const count = parseInt(countResult.rows[0].count);
          console.log(`📊 ${tableName}: ${count} registros`);
        } catch (error) {
          console.error(`❌ Erro ao contar ${tableName}:`, error.message);
        }
      }
    }

    // Verificar empresas
    try {
      const companiesQuery = 'SELECT COUNT(*) as count FROM companies';
      const companiesResult = await pool.query(companiesQuery);
      const companiesCount = parseInt(companiesResult.rows[0].count);
      console.log(`\n🏢 Empresas cadastradas: ${companiesCount}`);
    } catch (error) {
      console.error('❌ Erro ao verificar empresas:', error.message);
    }

    // Resumo
    const existingTables = Object.values(results).filter(exists => exists).length;
    const totalTables = cardapioTables.length;
    
    console.log(`\n📋 RESUMO:`);
    console.log(`✅ Tabelas existentes: ${existingTables}/${totalTables}`);
    console.log(`❌ Tabelas faltando: ${totalTables - existingTables}`);
    
    if (existingTables === totalTables) {
      console.log('🎉 Todas as tabelas do cardápio estão configuradas!');
    } else {
      console.log('⚠️ Algumas tabelas estão faltando. Execute a migração.');
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  } finally {
    await pool.end();
  }
}

// Executar teste
testCardapioTables();

