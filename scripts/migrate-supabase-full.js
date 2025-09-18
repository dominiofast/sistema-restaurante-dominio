import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
const { Pool } = pkg;

// Configurações de conexão
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const neonConnectionString = process.env.DATABASE_URL;

console.log('🚀 Iniciando migração completa do Supabase para Neon');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis SUPABASE_URL e SUPABASE_KEY são obrigatórias');
  process.exit(1);
}

if (!neonConnectionString) {
  console.error('❌ Variável DATABASE_URL é obrigatória');
  process.exit(1);
}

// Inicializar conexões
const supabase = createClient(supabaseUrl, supabaseKey);
const neonPool = new Pool({ connectionString: neonConnectionString });

// Lista de tabelas para migrar (em ordem de dependências)
const tablesToMigrate = [
  'users',
  'companies', 
  'company_users',
  'categories',
  'products',
  'categorias_adicionais',
  'adicionais',
  'orders',
  'order_items',
  'customers',
  'customer_addresses',
  'ingredients',
  'product_ingredients',
  'recipes',
  'fiscal_data',
  'payment_methods',
  'delivery_zones',
  'promotions',
  'coupons',
  'inventory',
  'notifications',
  'reviews',
  'analytics',
  'integrations',
  'whatsapp_messages',
  'ai_agents',
  'prompts',
  'campaigns'
];

async function getTableColumns(tableName) {
  try {
    // Buscar colunas da tabela no Neon
    const result = await neonPool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    
    return result.rows.map(row => row.column_name);
  } catch (error) {
    console.warn(`⚠️  Tabela ${tableName} não existe no destino, será ignorada`);
    return [];
  }
}

async function migrateTable(tableName) {
  try {
    console.log(`\n📊 Processando tabela: ${tableName}`);
    
    // 1. Verificar se tabela existe no destino
    const columns = await getTableColumns(tableName);
    if (columns.length === 0) {
      console.log(`⏭️  Tabela ${tableName} não encontrada no destino, pulando...`);
      return { migrated: 0, errors: 0 };
    }

    // 2. Buscar dados do Supabase
    console.log(`🔍 Buscando dados do Supabase para ${tableName}...`);
    const { data: supabaseData, error: supabaseError } = await supabase
      .from(tableName)
      .select('*');

    if (supabaseError) {
      console.error(`❌ Erro ao buscar dados do Supabase para ${tableName}:`, supabaseError);
      return { migrated: 0, errors: 1 };
    }

    if (!supabaseData || supabaseData.length === 0) {
      console.log(`📭 Nenhum dado encontrado em ${tableName}`);
      return { migrated: 0, errors: 0 };
    }

    console.log(`📦 Encontrados ${supabaseData.length} registros em ${tableName}`);

    // 3. Preparar inserção no Neon
    let migrated = 0;
    let errors = 0;

    for (const row of supabaseData) {
      try {
        // Filtrar apenas colunas que existem na tabela de destino
        const filteredRow = {};
        columns.forEach(col => {
          if (row.hasOwnProperty(col)) {
            filteredRow[col] = row[col];
          }
        });

        if (Object.keys(filteredRow).length === 0) {
          continue;
        }

        // Construir query dinâmica
        const columnNames = Object.keys(filteredRow);
        const values = Object.values(filteredRow);
        const placeholders = values.map((_, index) => `$${index + 1}`);

        // Usar UPSERT para evitar conflitos
        const upsertQuery = `
          INSERT INTO ${tableName} (${columnNames.join(', ')})
          VALUES (${placeholders.join(', ')})
          ON CONFLICT (id) DO UPDATE SET
          ${columnNames.filter(col => col !== 'id').map(col => `${col} = EXCLUDED.${col}`).join(', ')}
        `;

        await neonPool.query(upsertQuery, values);
        migrated++;

        if (migrated % 50 === 0) {
          console.log(`   ✅ ${migrated} registros migrados...`);
        }

      } catch (insertError) {
        // Se UPSERT falhar, tentar INSERT simples
        try {
          const columnNames = Object.keys(filteredRow);
          const values = Object.values(filteredRow);
          const placeholders = values.map((_, index) => `$${index + 1}`);

          const insertQuery = `
            INSERT INTO ${tableName} (${columnNames.join(', ')})
            VALUES (${placeholders.join(', ')})
          `;

          await neonPool.query(insertQuery, values);
          migrated++;
        } catch (finalError) {
          console.warn(`⚠️  Erro ao inserir registro em ${tableName}:`, finalError.message);
          errors++;
        }
      }
    }

    console.log(`✅ Tabela ${tableName}: ${migrated} registros migrados, ${errors} erros`);
    return { migrated, errors };

  } catch (error) {
    console.error(`❌ Erro geral na migração de ${tableName}:`, error);
    return { migrated: 0, errors: 1 };
  }
}

async function runFullMigration() {
  let totalMigrated = 0;
  let totalErrors = 0;

  console.log(`🎯 Migrando ${tablesToMigrate.length} tabelas...\n`);

  for (const tableName of tablesToMigrate) {
    const result = await migrateTable(tableName);
    totalMigrated += result.migrated;
    totalErrors += result.errors;
    
    // Pequena pausa entre tabelas
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n🎉 MIGRAÇÃO COMPLETA!`);
  console.log(`📊 Total de registros migrados: ${totalMigrated}`);
  console.log(`❌ Total de erros: ${totalErrors}`);

  if (totalErrors === 0) {
    console.log(`✅ Migração executada com sucesso!`);
  } else {
    console.log(`⚠️  Migração completada com ${totalErrors} erros.`);
  }
}

// Executar migração
runFullMigration()
  .then(() => {
    console.log('\n🏁 Processo finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal na migração:', error);
    process.exit(1);
  })
  .finally(() => {
    neonPool.end();
  });