// Script para verificar tabelas do cardápio no Neon
import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

async function checkTables() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não configurada');
    console.log('💡 Configure a variável DATABASE_URL no arquivo .env');
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🔍 Verificando tabelas do cardápio no Neon...\n');

    const tables = ['produtos', 'categorias', 'categorias_adicionais', 'adicionais', 'produto_categorias_adicionais', 'cardapio_branding'];
    const results = {};

    for (const table of tables) {
      try {
        const query = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1) as exists;`;
        const result = await pool.query(query, [table]);
        results[table] = result.rows[0].exists;
        console.log(`📋 ${table}: ${result.rows[0].exists ? '✅ Existe' : '❌ Não existe'}`);
      } catch (error) {
        console.error(`❌ Erro ao verificar ${table}:`, error.message);
        results[table] = false;
      }
    }

    console.log('\n📊 Verificando dados:');
    for (const table of tables) {
      if (results[table]) {
        try {
          const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
          const count = parseInt(countResult.rows[0].count);
          console.log(`📊 ${table}: ${count} registros`);
        } catch (error) {
          console.error(`❌ Erro ao contar ${table}:`, error.message);
        }
      }
    }

    const existing = Object.values(results).filter(Boolean).length;
    console.log(`\n📋 RESUMO: ${existing}/${tables.length} tabelas existem`);
    
    if (existing === tables.length) {
      console.log('🎉 Todas as tabelas estão configuradas!');
    } else {
      console.log('⚠️ Algumas tabelas estão faltando.');
    }

  } catch (error) {
    console.error('💥 Erro:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
