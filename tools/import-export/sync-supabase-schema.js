#!/usr/bin/env node

/**
 * 🔄 SINCRONIZAÇÃO INTELIGENTE: SUPABASE SCHEMA → NEON
 * 
 * Este script adiciona apenas as colunas que faltam no Neon,
 * mantendo as estruturas existentes intactas.
 */

import { createClient } from '@supabase/supabase-js';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

neonConfig.webSocketConstructor = ws;
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
  auth: { persistSession: false }
});

const neonPool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

// 📋 TABELAS PARA SINCRONIZAR
const TABELAS_SYNC = [
  'companies',
  'categorias', 
  'produtos',
  'pedidos'
];

/**
 * 🔍 Obter estrutura atual do Neon
 */
async function obterEstruturaNeon(tabela) {
  const query = `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_name = $1 AND table_schema = 'public'
    ORDER BY ordinal_position;
  `;
  
  const result = await neonPool.query(query, [tabela]);
  
  const colunas = {};
  result.rows.forEach(row => {
    colunas[row.column_name] = {
      tipo: row.data_type,
      nullable: row.is_nullable === 'YES'
    };
  });
  
  return colunas;
}

/**
 * 🔍 Obter estrutura do Supabase
 */
async function obterEstruturaSupabase(tabela) {
  try {
    const { data, error } = await supabase.from(tabela).select('*').limit(1);
    
    if (error || !data || data.length === 0) {
      return {};
    }
    
    const exemplo = data[0];
    const colunas = {};
    
    Object.keys(exemplo).forEach(coluna => {
      const valor = exemplo[coluna];
      let tipo = 'TEXT';
      
      if (coluna.includes('_id') || coluna === 'id') {
        tipo = 'UUID';
      } else if (coluna.includes('_at') || coluna.includes('created') || coluna.includes('updated')) {
        tipo = 'TIMESTAMP WITH TIME ZONE';
      } else if (typeof valor === 'boolean') {
        tipo = 'BOOLEAN';
      } else if (typeof valor === 'number') {
        tipo = Number.isInteger(valor) ? 'INTEGER' : 'DECIMAL(10,2)';
      } else if (Array.isArray(valor) || (typeof valor === 'object' && valor !== null)) {
        tipo = 'JSONB';
      } else if (typeof valor === 'string' && valor.length <= 255) {
        tipo = 'VARCHAR(255)';
      }
      
      colunas[coluna] = { tipo };
    });
    
    return colunas;
    
  } catch (error) {
    console.log(`   ⚠️ Erro ao analisar ${tabela}:`, error.message);
    return {};
  }
}

/**
 * ➕ Adicionar coluna faltante
 */
async function adicionarColuna(tabela, coluna, tipo) {
  try {
    const sql = `ALTER TABLE ${tabela} ADD COLUMN IF NOT EXISTS ${coluna} ${tipo};`;
    await neonPool.query(sql);
    console.log(`   ✅ Adicionada coluna: ${coluna} (${tipo})`);
    return true;
  } catch (error) {
    console.log(`   ❌ Erro ao adicionar ${coluna}:`, error.message);
    return false;
  }
}

/**
 * 🔄 Sincronizar esquema de uma tabela
 */
async function sincronizarTabela(tabela) {
  console.log(`\n🔄 Sincronizando: ${tabela}`);
  
  try {
    // Obter estruturas
    console.log(`   🔍 Analisando estruturas...`);
    const [estruturaNeon, estruturaSupabase] = await Promise.all([
      obterEstruturaNeon(tabela),
      obterEstruturaSupabase(tabela)
    ]);
    
    const colunasNeon = Object.keys(estruturaNeon);
    const colunasSupabase = Object.keys(estruturaSupabase);
    
    console.log(`   📊 Neon: ${colunasNeon.length} colunas`);
    console.log(`   📊 Supabase: ${colunasSupabase.length} colunas`);
    
    // Encontrar colunas que faltam no Neon
    const colunasFaltando = colunasSupabase.filter(col => !colunasNeon.includes(col));
    
    if (colunasFaltando.length === 0) {
      console.log(`   ✅ ${tabela} já está sincronizada`);
      return { success: true, added: 0 };
    }
    
    console.log(`   📋 Colunas faltando: ${colunasFaltando.join(', ')}`);
    
    // Adicionar cada coluna faltante
    let adicionadas = 0;
    for (const coluna of colunasFaltando) {
      const tipo = estruturaSupabase[coluna].tipo;
      const sucesso = await adicionarColuna(tabela, coluna, tipo);
      if (sucesso) adicionadas++;
    }
    
    console.log(`   ✅ Sincronização concluída: ${adicionadas}/${colunasFaltando.length} colunas adicionadas`);
    
    return { success: true, added: adicionadas };
    
  } catch (error) {
    console.error(`   ❌ Erro na sincronização de ${tabela}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * 📥 Importar dados após sincronização
 */
async function importarDadosTabela(tabela) {
  console.log(`\n📥 Importando dados: ${tabela}`);
  
  try {
    // Buscar dados do Supabase
    let todosOsDados = [];
    let inicio = 0;
    const tamanhoPagina = 100;
    
    while (true) {
      const { data, error } = await supabase
        .from(tabela)
        .select('*')
        .range(inicio, inicio + tamanhoPagina - 1);
      
      if (error) break;
      if (!data || data.length === 0) break;
      
      todosOsDados = todosOsDados.concat(data);
      inicio += tamanhoPagina;
      
      if (data.length < tamanhoPagina) break;
    }
    
    console.log(`   📊 Encontrados: ${todosOsDados.length} registros`);
    
    if (todosOsDados.length === 0) {
      return { success: true, imported: 0 };
    }
    
    // Importar com UPSERT
    let importados = 0;
    for (const registro of todosOsDados) {
      try {
        const colunas = Object.keys(registro);
        const valores = Object.values(registro);
        const placeholders = valores.map((_, i) => `$${i + 1}`).join(', ');
        
        const insertQuery = `
          INSERT INTO ${tabela} (${colunas.join(', ')}) 
          VALUES (${placeholders})
          ON CONFLICT (id) DO UPDATE SET
          ${colunas.filter(col => col !== 'id').map(col => `${col} = EXCLUDED.${col}`).join(', ')}
        `;
        
        await neonPool.query(insertQuery, valores);
        importados++;
        
      } catch (insertError) {
        // Ignorar erros de inserção por agora
      }
    }
    
    console.log(`   ✅ Importados: ${importados}/${todosOsDados.length} registros`);
    
    return { success: true, imported: importados, total: todosOsDados.length };
    
  } catch (error) {
    console.error(`   ❌ Erro na importação de ${tabela}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * 🚀 Executar sincronização completa
 */
async function executarSincronizacao() {
  console.log('🔄 INICIANDO SINCRONIZAÇÃO INTELIGENTE SUPABASE → NEON');
  console.log('='.repeat(50));
  
  const resultados = {
    sincronizadas: 0,
    importadas: 0,
    totalRegistros: 0
  };
  
  // Testar conexões
  console.log('🔌 Testando conexões...');
  try {
    await supabase.from('companies').select('count').limit(1);
    console.log('   ✅ Supabase conectado');
    
    await neonPool.query('SELECT 1');
    console.log('   ✅ Neon conectado');
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    process.exit(1);
  }
  
  // Sincronizar esquemas
  console.log('\n🎯 FASE 1: SINCRONIZANDO ESQUEMAS');
  for (const tabela of TABELAS_SYNC) {
    const resultado = await sincronizarTabela(tabela);
    if (resultado.success && resultado.added > 0) {
      resultados.sincronizadas++;
    }
  }
  
  // Importar dados
  console.log('\n🎯 FASE 2: IMPORTANDO DADOS');
  for (const tabela of TABELAS_SYNC) {
    const resultado = await importarDadosTabela(tabela);
    if (resultado.success) {
      resultados.importadas++;
      resultados.totalRegistros += resultado.imported || 0;
    }
  }
  
  // Relatório final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RELATÓRIO FINAL');
  console.log('='.repeat(50));
  console.log(`🔄 Tabelas sincronizadas: ${resultados.sincronizadas}`);
  console.log(`📥 Tabelas importadas: ${resultados.importadas}`);
  console.log(`📊 Total de registros: ${resultados.totalRegistros}`);
  
  if (resultados.importadas > 0) {
    console.log('\n🎉 SINCRONIZAÇÃO CONCLUÍDA!');
    console.log('🔄 Reinicie o servidor para ver os novos dados');
  }
  
  await neonPool.end();
  process.exit(0);
}

// 🎯 EXECUTAR
if (import.meta.url === `file://${process.argv[1]}`) {
  executarSincronizacao().catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

export { executarSincronizacao };