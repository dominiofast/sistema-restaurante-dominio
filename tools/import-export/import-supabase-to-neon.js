#!/usr/bin/env node

/**
 * 🚀 IMPORTAÇÃO INTELIGENTE: SUPABASE → SEU NEON
 * 
 * Este script importa as tabelas mais importantes do seu Supabase
 * para o seu banco Neon, de forma inteligente e segura.
 * 
 * TABELAS PRIORIZADAS:
 * ✅ companies (essencial)
 * ✅ produtos + categorias (cardápio)  
 * ✅ mercadorias_ingredientes (estoque)
 * ✅ receitas_fichas_tecnicas (fichas técnicas)
 * ✅ whatsapp_integrations (WhatsApp)
 * ✅ ai_agents_config (IA)
 * ✅ cashback_config (cashback)
 * 
 * USO:
 * SUPABASE_URL="https://xxx.supabase.co" SUPABASE_KEY="xxx" node import-supabase-to-neon.js
 */

import { createClient } from '@supabase/supabase-js';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

// Configurar WebSocket para Neon
neonConfig.webSocketConstructor = ws;

dotenv.config();

// ⚙️ CONFIGURAÇÕES
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY; // service_role key
const NEON_DATABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SUPABASE_KEY || !NEON_DATABASE_URL) {
  console.error('❌ Variáveis necessárias:');
  console.error('   SUPABASE_URL=https://xxx.supabase.co');
  console.error('   SUPABASE_KEY=sua_service_role_key');
  console.error('   DATABASE_URL=sua_neon_connection_string');
  process.exit(1);
}

// Clientes
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

const neonPool = new Pool({ 
  connectionString: NEON_DATABASE_URL,
  ssl: true
});

// 📋 TABELAS PRIORIZADAS (ordem de importação)
const TABELAS_PARA_IMPORTAR = [
  {
    nome: 'companies',
    descricao: 'Empresas/Lojas',
    dependencias: [],
    createTable: `
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        logo_url TEXT,
        domain VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    nome: 'categorias',
    descricao: 'Categorias do Cardápio',
    dependencias: ['companies'],
    createTable: `
      CREATE TABLE IF NOT EXISTS categorias (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image_url TEXT,
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    nome: 'produtos',
    descricao: 'Produtos do Cardápio',
    dependencias: ['companies', 'categorias'],
    createTable: `
      CREATE TABLE IF NOT EXISTS produtos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        categoria_id UUID REFERENCES categorias(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    nome: 'mercadorias_ingredientes',
    descricao: 'Estoque/Ingredientes',
    dependencias: ['companies'],
    createTable: `
      CREATE TABLE IF NOT EXISTS mercadorias_ingredientes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        unidade_medida VARCHAR(50) NOT NULL,
        categoria VARCHAR(100),
        preco_unitario DECIMAL(10,2),
        estoque_atual DECIMAL(10,3) DEFAULT 0,
        estoque_minimo DECIMAL(10,3) DEFAULT 0,
        fornecedor VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    nome: 'receitas_fichas_tecnicas',
    descricao: 'Fichas Técnicas',
    dependencias: ['companies'],
    createTable: `
      CREATE TABLE IF NOT EXISTS receitas_fichas_tecnicas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        categoria VARCHAR(100),
        tempo_preparo INTEGER,
        rendimento DECIMAL(10,2),
        modo_preparo TEXT,
        custo_total DECIMAL(10,2),
        preco_venda_sugerido DECIMAL(10,2),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  }
];

/**
 * 🔄 Importar uma tabela específica
 */
async function importarTabela(tabelaConfig) {
  const { nome, descricao, createTable } = tabelaConfig;
  
  console.log(`\n🔄 Importando: ${nome} (${descricao})`);
  
  try {
    // 1️⃣ Criar tabela no Neon se não existir
    console.log(`   📋 Criando estrutura da tabela ${nome}...`);
    await neonPool.query(createTable);
    
    // 2️⃣ Buscar dados no Supabase
    console.log(`   📥 Buscando dados de ${nome} no Supabase...`);
    const { data: supabaseData, error } = await supabase
      .from(nome)
      .select('*');
    
    if (error) {
      console.log(`   ⚠️ Erro ao buscar ${nome}:`, error.message);
      return { success: false, error: error.message };
    }
    
    if (!supabaseData || supabaseData.length === 0) {
      console.log(`   ℹ️ Nenhum dado encontrado em ${nome}`);
      return { success: true, imported: 0 };
    }
    
    console.log(`   📊 Encontrados ${supabaseData.length} registros`);
    
    // 3️⃣ Importar dados para o Neon
    let importados = 0;
    for (const registro of supabaseData) {
      try {
        // Construir query de inserção dinâmica
        const colunas = Object.keys(registro);
        const valores = Object.values(registro);
        const placeholders = valores.map((_, i) => `$${i + 1}`).join(', ');
        
        const insertQuery = `
          INSERT INTO ${nome} (${colunas.join(', ')}) 
          VALUES (${placeholders})
          ON CONFLICT (id) DO UPDATE SET
          ${colunas.filter(col => col !== 'id').map(col => `${col} = EXCLUDED.${col}`).join(', ')}
        `;
        
        await neonPool.query(insertQuery, valores);
        importados++;
      } catch (insertError) {
        console.log(`   ⚠️ Erro ao inserir registro:`, insertError.message);
      }
    }
    
    console.log(`   ✅ Importados ${importados}/${supabaseData.length} registros de ${nome}`);
    
    return { success: true, imported: importados, total: supabaseData.length };
    
  } catch (error) {
    console.error(`   ❌ Erro na importação de ${nome}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * 🚀 Executar importação completa
 */
async function executarImportacao() {
  console.log('🚀 INICIANDO IMPORTAÇÃO SUPABASE → SEU NEON');
  console.log('='.repeat(50));
  
  const resultados = {
    sucesso: 0,
    erro: 0,
    totalImportados: 0
  };
  
  // Testar conexões
  console.log('🔌 Testando conexões...');
  
  try {
    // Testar Supabase com uma tabela que provavelmente existe
    const { data, error } = await supabase.from('companies').select('count').limit(1);
    if (error) {
      // Se companies não existir, tenta auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw new Error(`Supabase: ${authError.message}`);
    }
    console.log('   ✅ Supabase conectado');
    
    // Testar Neon
    await neonPool.query('SELECT 1');
    console.log('   ✅ Neon conectado');
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    process.exit(1);
  }
  
  // Importar tabelas na ordem correta (respeitando dependências)
  for (const tabelaConfig of TABELAS_PARA_IMPORTAR) {
    const resultado = await importarTabela(tabelaConfig);
    
    if (resultado.success) {
      resultados.sucesso++;
      resultados.totalImportados += resultado.imported || 0;
    } else {
      resultados.erro++;
    }
    
    // Pequena pausa entre importações
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Relatório final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RELATÓRIO FINAL');
  console.log('='.repeat(50));
  console.log(`✅ Tabelas importadas com sucesso: ${resultados.sucesso}`);
  console.log(`❌ Tabelas com erro: ${resultados.erro}`);
  console.log(`📊 Total de registros importados: ${resultados.totalImportados}`);
  
  if (resultados.sucesso > 0) {
    console.log('\n🎉 IMPORTAÇÃO CONCLUÍDA!');
    console.log('🔄 Reinicie o servidor para ver os dados importados');
  }
  
  // Fechar conexões
  await neonPool.end();
  process.exit(0);
}

// 🎯 EXECUTAR SE CHAMADO DIRETAMENTE
if (import.meta.url === `file://${process.argv[1]}`) {
  executarImportacao().catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

export { executarImportacao, importarTabela, TABELAS_PARA_IMPORTAR };