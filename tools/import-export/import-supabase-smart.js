#!/usr/bin/env node

/**
 * 🧠 IMPORTAÇÃO INTELIGENTE: SUPABASE → SEU NEON 
 * 
 * Este script descobre automaticamente a estrutura das tabelas
 * no Supabase e recria no seu Neon, preservando todos os dados.
 */

import { createClient } from '@supabase/supabase-js';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

// Configurar WebSocket para Neon
neonConfig.webSocketConstructor = ws;
dotenv.config();

// Configurações
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const NEON_DATABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SUPABASE_KEY || !NEON_DATABASE_URL) {
  console.error('❌ Variáveis obrigatórias: SUPABASE_URL, SUPABASE_KEY, DATABASE_URL');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

const neonPool = new Pool({ 
  connectionString: NEON_DATABASE_URL,
  ssl: true
});

// 📋 TABELAS PRIORITÁRIAS PARA IMPORTAR
const TABELAS_PRIORITARIAS = [
  'companies',
  'categorias', 
  'produtos',
  'mercadorias_ingredientes',
  'receitas_fichas_tecnicas',
  'whatsapp_integrations',
  'cashback_config',
  'ai_agents_config',
  'pedidos',
  'users'
];

/**
 * 🔍 Descobrir estrutura real da tabela no Supabase
 */
async function descobrirEstruturaTabelaSupabase(nomeTabela) {
  try {
    // Pegar apenas 1 registro para descobrir as colunas
    const { data, error } = await supabase
      .from(nomeTabela)
      .select('*')
      .limit(1);
    
    if (error || !data || data.length === 0) {
      return null; // Tabela não existe ou está vazia
    }
    
    const primeiroRegistro = data[0];
    const colunas = Object.keys(primeiroRegistro);
    
    console.log(`   🔍 Descobertas ${colunas.length} colunas: ${colunas.join(', ')}`);
    
    return {
      colunas,
      exemplo: primeiroRegistro
    };
    
  } catch (error) {
    console.log(`   ⚠️ Erro ao analisar ${nomeTabela}:`, error.message);
    return null;
  }
}

/**
 * 🏗️ Criar tabela dinâmica no Neon baseada na estrutura do Supabase
 */
function criarSqlTabelaDinamica(nomeTabela, estrutura) {
  const { colunas, exemplo } = estrutura;
  
  // Começar com CREATE TABLE
  let sql = `CREATE TABLE IF NOT EXISTS ${nomeTabela} (\n`;
  
  const definicoesColunas = colunas.map(coluna => {
    const valor = exemplo[coluna];
    let tipoDados = 'TEXT'; // Padrão
    
    // Detectar tipo baseado no valor
    if (coluna === 'id') {
      tipoDados = 'UUID PRIMARY KEY DEFAULT gen_random_uuid()';
    } else if (coluna.includes('_id') || coluna.includes('Id')) {
      tipoDados = 'UUID';
    } else if (coluna.includes('_at') || coluna === 'created' || coluna === 'updated') {
      tipoDados = 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()';
    } else if (typeof valor === 'boolean') {
      tipoDados = 'BOOLEAN DEFAULT false';
    } else if (typeof valor === 'number') {
      if (Number.isInteger(valor)) {
        tipoDados = 'INTEGER';
      } else {
        tipoDados = 'DECIMAL(10,2)';
      }
    } else if (typeof valor === 'string') {
      if (valor && valor.length > 255) {
        tipoDados = 'TEXT';
      } else {
        tipoDados = 'VARCHAR(255)';
      }
    } else if (Array.isArray(valor)) {
      tipoDados = 'JSONB';
    } else if (typeof valor === 'object' && valor !== null) {
      tipoDados = 'JSONB';
    }
    
    return `  ${coluna} ${tipoDados}`;
  });
  
  sql += definicoesColunas.join(',\n');
  sql += '\n);';
  
  return sql;
}

/**
 * 📥 Importar tabela com estrutura dinâmica
 */
async function importarTabelaDinamica(nomeTabela) {
  console.log(`\n🔄 Importando: ${nomeTabela}`);
  
  try {
    // 1️⃣ Descobrir estrutura no Supabase
    console.log(`   🔍 Analisando estrutura de ${nomeTabela}...`);
    const estrutura = await descobrirEstruturaTabelaSupabase(nomeTabela);
    
    if (!estrutura) {
      console.log(`   ℹ️ Tabela ${nomeTabela} não encontrada ou vazia no Supabase`);
      return { success: false, reason: 'not_found' };
    }
    
    // 2️⃣ Criar tabela no Neon com estrutura dinâmica
    console.log(`   📋 Criando tabela ${nomeTabela} no Neon...`);
    const createTableSql = criarSqlTabelaDinamica(nomeTabela, estrutura);
    await neonPool.query(createTableSql);
    
    // 3️⃣ Buscar TODOS os dados no Supabase
    console.log(`   📥 Buscando todos os dados de ${nomeTabela}...`);
    let todosOsDados = [];
    let inicio = 0;
    const tamanhoPagina = 1000;
    
    while (true) {
      const { data, error } = await supabase
        .from(nomeTabela)
        .select('*')
        .range(inicio, inicio + tamanhoPagina - 1);
      
      if (error) {
        console.log(`   ⚠️ Erro ao buscar dados:`, error.message);
        break;
      }
      
      if (!data || data.length === 0) {
        break; // Não há mais dados
      }
      
      todosOsDados = todosOsDados.concat(data);
      inicio += tamanhoPagina;
      
      console.log(`   📊 Coletados ${todosOsDados.length} registros...`);
      
      if (data.length < tamanhoPagina) {
        break; // Última página
      }
    }
    
    console.log(`   📊 Total encontrado: ${todosOsDados.length} registros`);
    
    if (todosOsDados.length === 0) {
      return { success: true, imported: 0, total: 0 };
    }
    
    // 4️⃣ Importar dados para o Neon (com upsert)
    console.log(`   💾 Importando para o Neon...`);
    
    let importados = 0;
    for (const registro of todosOsDados) {
      try {
        const colunas = Object.keys(registro);
        const valores = Object.values(registro);
        const placeholders = valores.map((_, i) => `$${i + 1}`).join(', ');
        
        // Query com UPSERT (ON CONFLICT DO UPDATE)
        const insertQuery = `
          INSERT INTO ${nomeTabela} (${colunas.join(', ')}) 
          VALUES (${placeholders})
          ON CONFLICT (id) DO UPDATE SET
          ${colunas.filter(col => col !== 'id').map(col => `${col} = EXCLUDED.${col}`).join(', ')}
        `;
        
        await neonPool.query(insertQuery, valores);
        importados++;
        
        // Progress a cada 10 registros
        if (importados % 10 === 0) {
          console.log(`   📊 Importados ${importados}/${todosOsDados.length}`);
        }
        
      } catch (insertError) {
        console.log(`   ⚠️ Erro ao inserir:`, insertError.message);
      }
    }
    
    console.log(`   ✅ CONCLUÍDO: ${importados}/${todosOsDados.length} registros de ${nomeTabela}`);
    
    return { success: true, imported: importados, total: todosOsDados.length };
    
  } catch (error) {
    console.error(`   ❌ Erro na importação de ${nomeTabela}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * 🚀 Executar importação inteligente completa
 */
async function executarImportacaoInteligente() {
  console.log('🧠 INICIANDO IMPORTAÇÃO INTELIGENTE SUPABASE → SEU NEON');
  console.log('='.repeat(60));
  
  const resultados = {
    sucesso: 0,
    erro: 0,
    totalImportados: 0,
    detalhes: []
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
  
  // Importar cada tabela
  for (const nomeTabela of TABELAS_PRIORITARIAS) {
    const resultado = await importarTabelaDinamica(nomeTabela);
    
    if (resultado.success) {
      resultados.sucesso++;
      resultados.totalImportados += resultado.imported || 0;
      resultados.detalhes.push({
        tabela: nomeTabela,
        status: 'sucesso',
        importados: resultado.imported || 0,
        total: resultado.total || 0
      });
    } else {
      resultados.erro++;
      resultados.detalhes.push({
        tabela: nomeTabela,
        status: 'erro',
        motivo: resultado.reason || resultado.error || 'desconhecido'
      });
    }
    
    // Pausa entre tabelas
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Relatório final detalhado
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL DETALHADO');
  console.log('='.repeat(60));
  
  resultados.detalhes.forEach(detalhe => {
    if (detalhe.status === 'sucesso') {
      console.log(`✅ ${detalhe.tabela}: ${detalhe.importados}/${detalhe.total} registros`);
    } else {
      console.log(`❌ ${detalhe.tabela}: ${detalhe.motivo}`);
    }
  });
  
  console.log('\n📈 RESUMO:');
  console.log(`✅ Tabelas importadas: ${resultados.sucesso}`);
  console.log(`❌ Tabelas com erro: ${resultados.erro}`);
  console.log(`📊 Total de registros: ${resultados.totalImportados}`);
  
  if (resultados.sucesso > 0) {
    console.log('\n🎉 IMPORTAÇÃO INTELIGENTE CONCLUÍDA!');
    console.log('🔄 Seus dados do Supabase estão agora no SEU Neon!');
  }
  
  await neonPool.end();
  process.exit(0);
}

// 🎯 EXECUTAR
if (import.meta.url === `file://${process.argv[1]}`) {
  executarImportacaoInteligente().catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

export { executarImportacaoInteligente };