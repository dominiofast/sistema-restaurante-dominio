import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
const { Pool } = pkg;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const neonConnectionString = process.env.DATABASE_URL;

console.log('🍕 Migrando produtos do Supabase para Neon');

const supabase = createClient(supabaseUrl, supabaseKey);
const neonPool = new Pool({ connectionString: neonConnectionString });

async function migrateProducts() {
  try {
    // 1. Buscar produtos do Supabase
    console.log('🔍 Buscando produtos do Supabase...');
    const { data: products, error } = await supabase
      .from('produtos')
      .select('*');

    if (error) {
      console.error('❌ Erro ao buscar do Supabase:', error);
      return;
    }

    if (!products || products.length === 0) {
      console.log('📭 Nenhum produto encontrado no Supabase');
      return;
    }

    console.log(`📦 Encontrados ${products.length} produtos no Supabase`);

    // 2. Verificar colunas da tabela de destino
    const columnsResult = await neonPool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'produtos' ORDER BY ordinal_position
    `);
    const availableColumns = columnsResult.rows.map(row => row.column_name);
    console.log('📋 Colunas disponíveis:', availableColumns.join(', '));

    // 3. Migrar produtos
    let migrated = 0;
    let updated = 0;
    let errors = 0;

    for (const product of products) {
      try {
        // Filtrar apenas colunas que existem
        const filteredProduct = {};
        availableColumns.forEach(col => {
          if (product.hasOwnProperty(col)) {
            filteredProduct[col] = product[col];
          }
        });

        if (Object.keys(filteredProduct).length === 0) {
          continue;
        }

        // Tentar UPSERT
        const columnNames = Object.keys(filteredProduct);
        const values = Object.values(filteredProduct);
        const placeholders = values.map((_, index) => `$${index + 1}`);

        const upsertQuery = `
          INSERT INTO produtos (${columnNames.join(', ')})
          VALUES (${placeholders.join(', ')})
          ON CONFLICT (id) DO UPDATE SET
          ${columnNames.filter(col => col !== 'id').map(col => `${col} = EXCLUDED.${col}`).join(', ')}
        `;

        await neonPool.query(upsertQuery, values);
        migrated++;

        if (migrated % 25 === 0) {
          console.log(`   ✅ ${migrated} produtos processados...`);
        }

      } catch (insertError) {
        console.warn(`⚠️  Erro ao processar produto ${product.name || product.id}:`, insertError.message);
        errors++;
      }
    }

    console.log(`\n🎉 MIGRAÇÃO DE PRODUTOS COMPLETA!`);
    console.log(`✅ ${migrated} produtos processados`);
    console.log(`❌ ${errors} erros`);

    // 4. Verificar resultado final
    const result = await neonPool.query('SELECT COUNT(*) as total FROM produtos');
    console.log(`📊 Total de produtos no banco: ${result.rows[0].total}`);

  } catch (error) {
    console.error('💥 Erro na migração:', error);
  } finally {
    await neonPool.end();
  }
}

migrateProducts();