import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
const { Pool } = pkg;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const neonConnectionString = process.env.DATABASE_URL;

console.log('🔗 Migrando associações produto-categorias do Supabase para Neon');

const supabase = createClient(supabaseUrl, supabaseKey);
const neonPool = new Pool({ connectionString: neonConnectionString });

async function migrateProductCategoryRelations() {
  try {
    // 1. Buscar dados do Supabase
    console.log('🔍 Buscando associações do Supabase...');
    const { data: relations, error } = await supabase
      .from('produto_categorias_adicionais')
      .select('*');

    if (error) {
      console.error('❌ Erro ao buscar do Supabase:', error);
      return;
    }

    if (!relations || relations.length === 0) {
      console.log('📭 Nenhuma associação encontrada no Supabase');
      return;
    }

    console.log(`📦 Encontradas ${relations.length} associações no Supabase`);

    // 2. Limpar dados antigos do Neon
    console.log('🧹 Limpando associações antigas...');
    await neonPool.query('DELETE FROM produto_categorias_adicionais');

    // 3. Inserir novas associações
    let inserted = 0;
    let errors = 0;

    console.log('💫 Migrando associações...');
    
    for (const relation of relations) {
      try {
        const insertQuery = `
          INSERT INTO produto_categorias_adicionais 
          (id, produto_id, categoria_adicional_id, is_required, min_selection, max_selection, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        
        await neonPool.query(insertQuery, [
          relation.id,
          relation.produto_id,
          relation.categoria_adicional_id,
          relation.is_required || false,
          relation.min_selection || 0,
          relation.max_selection || 1,
          relation.created_at || new Date()
        ]);

        inserted++;

        if (inserted % 10 === 0) {
          console.log(`   ✅ ${inserted} associações migradas...`);
        }

      } catch (insertError) {
        console.warn(`⚠️  Erro ao inserir associação:`, insertError.message);
        errors++;
      }
    }

    console.log(`\n🎉 MIGRAÇÃO COMPLETA!`);
    console.log(`✅ ${inserted} associações migradas`);
    console.log(`❌ ${errors} erros`);

    // 4. Verificar resultado
    const result = await neonPool.query('SELECT COUNT(*) as total FROM produto_categorias_adicionais');
    console.log(`📊 Total de associações no banco: ${result.rows[0].total}`);

  } catch (error) {
    console.error('💥 Erro na migração:', error);
  } finally {
    await neonPool.end();
  }
}

migrateProductCategoryRelations();