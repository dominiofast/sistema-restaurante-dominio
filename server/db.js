import { Pool, neonConfig } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import ws from "ws";

// 🎯 SEU PRÓPRIO NEON - CONTROLE TOTAL!
neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL é obrigatório!');
  console.error('🔗 Configure sua connection string do SEU Neon em Secrets');
  console.error('📋 Exemplo: postgresql://user:pass@host/db?sslmode=require');
  process.exit(1);
}

// Pool de conexões Neon
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({ 
      connectionString: DATABASE_URL,
      ssl: true
    });
    console.log('✅ Conectado ao SEU Neon!');
  }
  return pool;
}

// 🔐 AUTHENTICATION FUNCTIONS
export async function authenticateUser(email, password) {
  try {
    console.log('🔍 Autenticando usuário:', email);
    
    const query = `
      SELECT id, email, name, role, password, created_at
      FROM users 
      WHERE email = $1
    `;
    
    const result = await getPool().query(query, [email.toLowerCase()]);
    
    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado:', email);
      return null;
    }
    
    const user = result.rows[0];
    
    if (!user.password) {
      console.log('❌ Usuário sem senha:', email);
      return null;
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Senha incorreta para:', email);
      return null;
    }

    console.log('✅ Usuário autenticado:', { email: user.email, role: user.role });
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
    
  } catch (error) {
    console.error('💥 Erro na autenticação Neon:', error);
    throw error;
  }
}

// 👑 CREATE SUPERADMIN USER  
export async function createSuperadmin() {
  try {
    // Primeiro, garantir que tabela users existe
    await createUsersTableIfNotExists();
    
    // Verificar se já existe
    const existingQuery = `SELECT id, email, role FROM users WHERE email = 'contato@dominio.tech'`;
    const existingResult = await getPool().query(existingQuery);

    if (existingResult.rows.length > 0) {
      console.log('✅ Superadmin já existe no SEU Neon');
      return {
        exists: true,
        user: existingResult.rows[0]
      };
    }

    // Criar superadmin
    const hashedPassword = await bcrypt.hash('Admin123!@#', 12);
    
    const createQuery = `
      INSERT INTO users (email, name, role, password, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, NOW(), NOW()) 
      RETURNING id, email, name, role, created_at
    `;
    
    const result = await getPool().query(createQuery, [
      'contato@dominio.tech',
      'Super Admin - SEU Neon',
      'super_admin',
      hashedPassword
    ]);

    console.log('🎉 Superadmin criado no SEU Neon!');
    
    return {
      exists: false,
      user: result.rows[0]
    };

  } catch (error) {
    console.error('💥 Erro ao criar superadmin no SEU Neon:', error);
    throw error;
  }
}

// 🗃️ CREATE TABLES IF NOT EXISTS
async function createUsersTableIfNotExists() {
  try {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await getPool().query(createUsersTable);
    console.log('✅ Tabela users garantida no SEU Neon');
    
    // Criar outras tabelas necessárias
    const createOrdersTables = `
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        company_id VARCHAR(255),
        numero_pedido VARCHAR(50),
        nome VARCHAR(255),
        telefone VARCHAR(50),
        endereco TEXT,
        status VARCHAR(50) DEFAULT 'novo',
        total DECIMAL(10,2),
        pagamento VARCHAR(50),
        tipo VARCHAR(50),
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS pedido_itens (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER REFERENCES pedidos(id),
        produto_id VARCHAR(255),
        nome_produto VARCHAR(255),
        quantidade INTEGER,
        valor_unitario DECIMAL(10,2),
        valor_total DECIMAL(10,2),
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS pedido_item_adicionais (
        id SERIAL PRIMARY KEY,
        pedido_item_id INTEGER REFERENCES pedido_itens(id),
        categoria_nome VARCHAR(255),
        nome_adicional VARCHAR(255),
        quantidade INTEGER,
        valor_unitario DECIMAL(10,2),
        valor_total DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await getPool().query(createOrdersTables);
    console.log('✅ Tabelas de pedidos garantidas no SEU Neon');
    
    // Criar tabelas de cardápio (categorias e adicionais)
    await ensureCardapioTables();
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas no SEU Neon:', error);
    throw error;
  }
}

// 📋 CARDÁPIO TABLES SETUP
async function ensureCardapioTables() {
  try {
    const createCardapioTables = `
      -- Habilitar extensão uuid-ossp se não existir
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      -- Tabela de categorias de adicionais
      CREATE TABLE IF NOT EXISTS categorias_adicionais (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id UUID NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        selection_type TEXT NOT NULL DEFAULT 'single' CHECK (selection_type IN ('single','multiple','quantity')),
        is_required BOOLEAN NOT NULL DEFAULT false,
        min_selection INTEGER NOT NULL DEFAULT 0,
        max_selection INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(company_id, name)
      );

      -- Tabela de adicionais
      CREATE TABLE IF NOT EXISTS adicionais (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        categoria_adicional_id UUID NOT NULL REFERENCES categorias_adicionais(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL DEFAULT 0,
        image TEXT,
        is_available BOOLEAN NOT NULL DEFAULT true,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(categoria_adicional_id, name)
      );

      -- Tabela de associação produtos <-> categorias de adicionais
      CREATE TABLE IF NOT EXISTS produto_categorias_adicionais (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        produto_id TEXT NOT NULL,
        categoria_adicional_id UUID NOT NULL REFERENCES categorias_adicionais(id) ON DELETE CASCADE,
        is_required BOOLEAN DEFAULT false,
        min_selection INTEGER DEFAULT 0,
        max_selection INTEGER DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(produto_id, categoria_adicional_id)
      );

      -- Índices para performance
      CREATE INDEX IF NOT EXISTS idx_categorias_adicionais_company ON categorias_adicionais(company_id);
      CREATE INDEX IF NOT EXISTS idx_adicionais_categoria ON adicionais(categoria_adicional_id);
      CREATE INDEX IF NOT EXISTS idx_produto_categorias_produto ON produto_categorias_adicionais(produto_id);
    `;

    await getPool().query(createCardapioTables);
    console.log('✅ Tabelas de cardápio garantidas no SEU Neon');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas de cardápio no SEU Neon:', error);
    throw error;
  }
}

// 🔄 IMPORT FUNCTIONS
export async function importCategoriaAdicional(categoriaData, client = getPool()) {
  try {
    const { id, company_id, name, description, selection_type = 'single', is_required = false, min_selection = 0, max_selection = 1 } = categoriaData;
    
    // Primeiro, verifica se já existe
    const existingQuery = `
      SELECT id, name FROM categorias_adicionais 
      WHERE company_id = $1 AND name = $2
    `;
    const existingResult = await client.query(existingQuery, [company_id, name]);
    
    if (existingResult.rows.length > 0) {
      console.log(`✅ Categoria já existe: ${name} -> ${existingResult.rows[0].id}`);
      return existingResult.rows[0];
    }
    
    // Se não existe, insere nova
    const insertQuery = `
      INSERT INTO categorias_adicionais (
        company_id, name, description, selection_type, is_required, min_selection, max_selection, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, name, created_at, updated_at
    `;
    
    const result = await client.query(insertQuery, [
      company_id, name, description, selection_type, is_required, min_selection, max_selection
    ]);
    
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Erro ao importar categoria adicional:', error);
    throw error;
  }
}

export async function importAdicional(adicionalData, categoriaId, client = getPool()) {
  try {
    const { id, name, description, price = 0, image, is_available = true, is_active = true } = adicionalData;
    
    // Primeiro, verifica se já existe
    const existingQuery = `
      SELECT id, name, price FROM adicionais 
      WHERE categoria_adicional_id = $1 AND name = $2
    `;
    const existingResult = await client.query(existingQuery, [categoriaId, name]);
    
    if (existingResult.rows.length > 0) {
      console.log(`✅ Adicional já existe: ${name} -> ${existingResult.rows[0].id}`);
      return existingResult.rows[0];
    }
    
    // Se não existe, insere novo
    const insertQuery = `
      INSERT INTO adicionais (
        categoria_adicional_id, name, description, price, image, is_available, is_active, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, name, price, created_at, updated_at
    `;
    
    const result = await client.query(insertQuery, [
      categoriaId, name, description, price, image, is_available, is_active
    ]);
    
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Erro ao importar adicional:', error);
    throw error;
  }
}

export async function importCardapioCompleto(importData) {
  const client = await getPool().connect();
  
  try {
    await client.query('BEGIN');
    console.log('🔄 Iniciando importação de cardápio...');
    
    const { company_id, categorias = [], adicionais = [] } = importData;
    const categoriaIdMap = new Map();
    let stats = {
      categorias_criadas: 0,
      categorias_atualizadas: 0,
      adicionais_criados: 0,
      adicionais_atualizados: 0,
      errors: []
    };

    // 1. Carregar categorias existentes da empresa
    const existingCategorias = await client.query(
      'SELECT id, name FROM categorias_adicionais WHERE company_id = $1',
      [company_id]
    );
    
    existingCategorias.rows.forEach(cat => {
      categoriaIdMap.set(cat.name, cat.id);
    });
    
    console.log(`📋 Categorias existentes carregadas: ${existingCategorias.rows.length}`);

    // 2. Importar novas categorias
    for (const categoria of categorias) {
      try {
        const result = await importCategoriaAdicional({ ...categoria, company_id }, client);
        categoriaIdMap.set(categoria.name, result.id);
        
        if (categoria.id && result.id === categoria.id) {
          stats.categorias_atualizadas++;
        } else {
          stats.categorias_criadas++;
        }
        
        console.log(`✅ Categoria processada: ${categoria.name} -> ${result.id}`);
      } catch (error) {
        stats.errors.push(`Erro na categoria ${categoria.name}: ${error.message}`);
        console.error(`❌ Erro na categoria ${categoria.name}:`, error);
      }
    }

    // 3. Importar adicionais
    for (const adicional of adicionais) {
      try {
        let categoriaId = adicional.categoria_adicional_id;
        
        // Se não tem categoria_id, buscar por nome
        if (!categoriaId && adicional.categoria_name) {
          categoriaId = categoriaIdMap.get(adicional.categoria_name);
        }
        
        if (!categoriaId) {
          throw new Error(`Categoria não encontrada para adicional: ${adicional.name}`);
        }
        
        const result = await importAdicional(adicional, categoriaId, client);
        
        if (adicional.id && result.id === adicional.id) {
          stats.adicionais_atualizados++;
        } else {
          stats.adicionais_criados++;
        }
        
        console.log(`✅ Adicional processado: ${adicional.name} -> ${result.id}`);
      } catch (error) {
        stats.errors.push(`Erro no adicional ${adicional.name}: ${error.message}`);
        console.error(`❌ Erro no adicional ${adicional.name}:`, error);
      }
    }

    await client.query('COMMIT');
    console.log('🎉 Importação de cardápio concluída!', stats);
    
    return {
      success: true,
      stats,
      categoriaIdMap: Object.fromEntries(categoriaIdMap)
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('💥 Erro na importação de cardápio:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 🛒 ORDER FUNCTIONS
export async function createPedido(pedidoData) {
  try {
    const { company_id, numero_pedido, nome, telefone, endereco, status, total, pagamento, tipo, observacoes } = pedidoData;
    
    const query = `
      INSERT INTO pedidos (company_id, numero_pedido, nome, telefone, endereco, status, total, pagamento, tipo, observacoes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING id, numero_pedido, status, total, created_at
    `;
    
    const result = await getPool().query(query, [
      company_id, numero_pedido, nome, telefone, endereco, 
      status, total, pagamento, tipo, observacoes
    ]);
    
    console.log('✅ Pedido criado no SEU Neon');
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Erro ao criar pedido no SEU Neon:', error);
    throw error;
  }
}

export async function createPedidoItem(itemData) {
  try {
    const { pedido_id, produto_id, nome_produto, quantidade, valor_unitario, valor_total, observacoes } = itemData;
    
    const query = `
      INSERT INTO pedido_itens (pedido_id, produto_id, nome_produto, quantidade, valor_unitario, valor_total, observacoes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, nome_produto, quantidade, valor_unitario, valor_total
    `;
    
    const result = await getPool().query(query, [
      pedido_id, produto_id, nome_produto, quantidade, valor_unitario, valor_total, observacoes
    ]);
    
    console.log('✅ Item adicionado no SEU Neon');
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Erro ao criar item no SEU Neon:', error);
    throw error;
  }
}

export async function createPedidoItemAdicional(adicionalData) {
  try {
    const { pedido_item_id, categoria_nome, nome_adicional, quantidade, valor_unitario, valor_total } = adicionalData;
    
    const query = `
      INSERT INTO pedido_item_adicionais (pedido_item_id, categoria_nome, nome_adicional, quantidade, valor_unitario, valor_total, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, nome_adicional, quantidade, valor_unitario, valor_total
    `;
    
    const result = await getPool().query(query, [
      pedido_item_id, categoria_nome, nome_adicional, quantidade, valor_unitario, valor_total
    ]);
    
    console.log('✅ Adicional salvo no SEU Neon');
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Erro ao criar adicional no SEU Neon:', error);
    throw error;
  }
}

// 📋 BUSCAR PEDIDOS COM ITENS
export async function getPedidosByCompany(companyId) {
  try {
    const query = `
      SELECT 
        p.*,
        pi.id as item_id,
        pi.nome_produto,
        pi.quantidade,
        pi.valor_unitario,
        pi.valor_total,
        pi.observacoes as item_observacoes,
        pia.id as adicional_id,
        pia.categoria_nome,
        pia.nome_adicional,
        pia.quantidade as adicional_quantidade,
        pia.valor_unitario as adicional_valor_unitario
      FROM pedidos p
      LEFT JOIN pedido_itens pi ON p.id = pi.pedido_id
      LEFT JOIN pedido_item_adicionais pia ON pi.id = pia.pedido_item_id
      WHERE p.company_id = $1
      ORDER BY p.created_at DESC, pi.id, pia.id
    `;
    
    const result = await getPool().query(query, [companyId]);
    
    // Agrupar resultados por pedido
    const pedidosMap = new Map();
    
    result.rows.forEach(row => {
      // Obter ou criar pedido
      if (!pedidosMap.has(row.id)) {
        pedidosMap.set(row.id, {
          id: row.id,
          numero_pedido: row.numero_pedido,
          company_id: row.company_id,
          nome: row.nome,
          telefone: row.telefone,
          endereco: row.endereco,
          status: row.status,
          tipo: row.tipo,
          total: parseFloat(row.total) || 0,
          pagamento: row.pagamento,
          observacoes: row.observacoes,
          created_at: row.created_at,
          updated_at: row.updated_at,
          horario: row.horario,
          origem: row.origem,
          pedido_itens: []
        });
      }
      
      const pedido = pedidosMap.get(row.id);
      
      // Adicionar item se existir e não foi adicionado ainda
      if (row.item_id && !pedido.pedido_itens.find(item => item.id === row.item_id)) {
        pedido.pedido_itens.push({
          id: row.item_id,
          nome_produto: row.nome_produto,
          quantidade: row.quantidade,
          valor_unitario: parseFloat(row.valor_unitario) || 0,
          valor_total: parseFloat(row.valor_total) || 0,
          observacoes: row.item_observacoes,
          pedido_item_adicionais: []
        });
      }
      
      // Adicionar adicional se existir
      if (row.adicional_id && row.item_id) {
        const item = pedido.pedido_itens.find(item => item.id === row.item_id);
        if (item) {
          item.pedido_item_adicionais.push({
            id: row.adicional_id,
            categoria_nome: row.categoria_nome,
            nome_adicional: row.nome_adicional,
            quantidade: row.adicional_quantidade,
            valor_unitario: parseFloat(row.adicional_valor_unitario) || 0
          });
        }
      }
    });
    
    const pedidos = Array.from(pedidosMap.values());
    console.log(`✅ Buscados ${pedidos.length} pedidos da empresa ${companyId}`);
    
    return pedidos;
    
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos no SEU Neon:', error);
    throw error;
  }
}

// 🔄 ATUALIZAR STATUS DO PEDIDO
export async function updatePedidoStatus(pedidoId, status) {
  try {
    const query = `
      UPDATE pedidos 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, status, updated_at
    `;
    
    const result = await getPool().query(query, [status, pedidoId]);
    
    if (result.rows.length === 0) {
      throw new Error(`Pedido ${pedidoId} não encontrado`);
    }
    
    console.log(`✅ Status do pedido ${pedidoId} atualizado para: ${status}`);
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Erro ao atualizar status no SEU Neon:', error);
    throw error;
  }
}

// 📋 FUNÇÕES PARA CATEGORIAS ADICIONAIS
export async function getCategoriasAdicionais(companyId) {
  try {
    console.log('🔍 Buscando categorias adicionais para empresa:', companyId);
    
    const query = `
      SELECT id, company_id, name, description, is_required, selection_type, 
             max_selection, min_selection, created_at, updated_at
      FROM categorias_adicionais 
      WHERE company_id = $1
      ORDER BY name ASC
    `;
    
    const result = await getPool().query(query, [companyId]);
    
    console.log(`✅ Categorias adicionais encontradas: ${result.rows.length}`);
    return result.rows;
    
  } catch (error) {
    console.error('💥 Erro ao buscar categorias adicionais:', error);
    throw error;
  }
}

// 📋 FUNÇÕES PARA ADICIONAIS
export async function getAdicionais(companyId) {
  try {
    console.log('🔍 Buscando adicionais para empresa:', companyId);
    
    const query = `
      SELECT a.id, a.categoria_adicional_id, a.name, a.description, a.price, 
             a.is_available, a.order_position, a.created_at, a.updated_at,
             ca.name as categoria_name
      FROM adicionais a
      INNER JOIN categorias_adicionais ca ON a.categoria_adicional_id = ca.id
      WHERE ca.company_id = $1
      ORDER BY a.order_position ASC, a.name ASC
    `;
    
    const result = await getPool().query(query, [companyId]);
    
    console.log(`✅ Adicionais encontrados: ${result.rows.length}`);
    return result.rows;
    
  } catch (error) {
    console.error('💥 Erro ao buscar adicionais:', error);
    throw error;
  }
}

// 📊 HEALTH CHECK
export function hasDatabase() {
  return !!process.env.DATABASE_URL;
}

// Testar conexão na inicialização
(async function testConnection() {
  try {
    const result = await getPool().query('SELECT 1 as test, current_database() as db');
    console.log('🎉 SEU Neon conectado!', { 
      test: result.rows[0].test, 
      database: result.rows[0].db 
    });
  } catch (error) {
    console.error('❌ Falha ao conectar SEU Neon:', error.message);
  }
})();