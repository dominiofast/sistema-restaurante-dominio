import bcrypt from 'bcryptjs';

// 🚀 MEMORY DATABASE - SEM COMPLICAÇÃO!
// Um só banco, em memória, zero configuração externa

let users = new Map();
let orders = new Map();
let companies = new Map();
let nextOrderId = 1;
let nextUserId = 1;

// 🔐 AUTHENTICATION FUNCTIONS
export async function authenticateUser(email, password) {
  try {
    console.log('🔍 Autenticando usuário:', email);
    
    // Buscar usuário por email
    const user = Array.from(users.values()).find(u => u.email === email.toLowerCase());
    
    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return null;
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Senha incorreta para:', email);
      return null;
    }

    console.log('✅ Usuário autenticado:', { email: user.email, role: user.role });
    
    // Retornar usuário sem senha
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
    
  } catch (error) {
    console.error('💥 Erro na autenticação:', error);
    throw error;
  }
}

// 👑 CREATE SUPERADMIN USER
export async function createSuperadmin() {
  try {
    // Verificar se já existe
    const existingUser = Array.from(users.values()).find(u => u.email === 'contato@dominio.tech');
    
    if (existingUser) {
      console.log('✅ Superadmin já existe');
      const { password: _, ...userWithoutPassword } = existingUser;
      return {
        exists: true,
        user: userWithoutPassword
      };
    }

    // Criar novo superadmin
    const hashedPassword = await bcrypt.hash('Admin123!@#', 12);
    
    const superadmin = {
      id: nextUserId++,
      email: 'contato@dominio.tech',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'super_admin',
      created_at: new Date()
    };

    users.set(superadmin.id, superadmin);
    console.log('🎉 Superadmin criado com sucesso!');
    
    const { password: _, ...userWithoutPassword } = superadmin;
    return {
      exists: false,
      user: userWithoutPassword
    };
    
  } catch (error) {
    console.error('💥 Erro ao criar superadmin:', error);
    throw error;
  }
}

// 🛒 ORDERS FUNCTIONS
export async function createPedido(pedidoData) {
  try {
    const novoPedido = {
      id: nextOrderId++,
      ...pedidoData,
      created_at: new Date(),
      status: pedidoData.status || 'novo',
      itens: []
    };

    orders.set(novoPedido.id, novoPedido);
    console.log('✅ Pedido criado:', novoPedido.id);
    
    return {
      id: novoPedido.id,
      numero_pedido: novoPedido.numero_pedido,
      status: novoPedido.status,
      total: novoPedido.total,
      created_at: novoPedido.created_at
    };
    
  } catch (error) {
    console.error('❌ Erro ao criar pedido:', error);
    throw error;
  }
}

export async function createPedidoItem(itemData) {
  try {
    const pedido = orders.get(parseInt(itemData.pedido_id));
    
    if (!pedido) {
      throw new Error(`Pedido ${itemData.pedido_id} não encontrado`);
    }
    
    const itemId = pedido.itens.length + 1;
    const novoItem = {
      id: itemId,
      ...itemData,
      adicionais: [],
      created_at: new Date()
    };
    
    pedido.itens.push(novoItem);
    orders.set(pedido.id, pedido);
    
    console.log('✅ Item adicionado ao pedido');
    
    return {
      id: itemId,
      nome_produto: itemData.nome_produto,
      quantidade: itemData.quantidade,
      valor_unitario: itemData.valor_unitario,
      valor_total: itemData.valor_total
    };
    
  } catch (error) {
    console.error('❌ Erro ao criar item pedido:', error);
    throw error;
  }
}

export async function createPedidoItemAdicional(adicionalData) {
  try {
    // ✅ CORRIGIDO: buscar pedido pelo pedido_id correto
    const pedido = orders.get(parseInt(adicionalData.pedido_id));
    
    if (!pedido) {
      throw new Error(`Pedido ${adicionalData.pedido_id} não encontrado`);
    }
    
    const item = pedido.itens.find(i => i.id === parseInt(adicionalData.pedido_item_id));
    
    if (!item) {
      throw new Error(`Item ${adicionalData.pedido_item_id} não encontrado no pedido`);
    }
    
    const adicionalId = item.adicionais.length + 1;
    const novoAdicional = {
      id: adicionalId,
      ...adicionalData,
      created_at: new Date()
    };
    
    item.adicionais.push(novoAdicional);
    orders.set(pedido.id, pedido);
    
    console.log('✅ Adicional adicionado ao item');
    
    return {
      id: adicionalId,
      nome_adicional: adicionalData.nome_adicional,
      quantidade: adicionalData.quantidade,
      valor_unitario: adicionalData.valor_unitario,
      valor_total: adicionalData.valor_total
    };
    
  } catch (error) {
    console.error('❌ Erro ao criar adicional item:', error);
    throw error;
  }
}

// 📊 STATUS FUNCTIONS
export function hasDatabase() {
  return true; // Sempre disponível (memória)
}

export function getDatabaseStats() {
  return {
    users: users.size,
    orders: orders.size,
    companies: companies.size
  };
}

console.log('🚀 Memory Database inicializado - Sem dependências externas!');