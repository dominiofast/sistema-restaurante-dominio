import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

// 🔥 MONGODB ATLAS CONNECTION - SERÁ CONFIGURADO VIA SECRETS
const MONGODB_URI = process.env.MONGODB_URI;
let client;
let db;

// Fail fast se não há MongoDB URI
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI é obrigatório! Configure via secrets.');
  process.exit(1);
}

// Initialize MongoDB connection
export async function connectMongoDB() {
  if (client) {
    return { client, db };
  }

  try {
    console.log('🔗 Conectando ao MongoDB Atlas...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('restaurant_system');
    console.log('✅ MongoDB Atlas conectado com sucesso!');
    return { client, db };
  } catch (error) {
    console.error('❌ Erro ao conectar MongoDB:', error.message);
    throw error;
  }
}

// Get collections
export async function getCollections() {
  if (!db) {
    await connectMongoDB();
  }
  
  return {
    users: db.collection('users'),
    companies: db.collection('companies'),
    orders: db.collection('orders'),
    products: db.collection('products')
  };
}

// 🔐 AUTHENTICATION FUNCTIONS
export async function authenticateUser(email, password) {
  try {
    console.log('🔍 Autenticando usuário:', email);
    
    const { users } = await getCollections();
    const user = await users.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Senha incorreta para:', email);
      return null;
    }

    console.log('✅ Usuário autenticado:', { email: user.email, role: user.role });
    
    // ✅ MANTER COMPATIBILIDADE COM SISTEMA EXISTENTE
    const { password: _, _id, ...userWithoutPassword } = user;
    return {
      id: _id.toString(), // ← Converter _id para id string
      ...userWithoutPassword
    };
    
  } catch (error) {
    console.error('💥 Erro na autenticação:', error);
    throw error;
  }
}

// 👑 CREATE SUPERADMIN USER
export async function createSuperadmin() {
  try {
    const { users } = await getCollections();
    
    // Verificar se já existe
    const existingUser = await users.findOne({ email: 'contato@dominio.tech' });
    
    if (existingUser) {
      console.log('✅ Superadmin já existe');
      const { password: _, _id, ...userWithoutPassword } = existingUser;
      return {
        exists: true,
        user: {
          id: _id.toString(), // ← Converter _id para id
          ...userWithoutPassword
        }
      };
    }

    // Criar novo superadmin
    const hashedPassword = await bcrypt.hash('Admin123!@#', 12);
    
    const superadmin = {
      email: 'contato@dominio.tech',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'super_admin',
      created_at: new Date()
    };

    const result = await users.insertOne(superadmin);
    
    if (result.insertedId) {
      console.log('🎉 Superadmin criado com sucesso!');
      const { password: _, ...userWithoutPassword } = superadmin;
      
      return {
        exists: false,
        user: {
          id: result.insertedId.toString(), // ← Converter _id para id
          ...userWithoutPassword
        }
      };
    }
    
    throw new Error('Falha ao inserir superadmin no banco');
    
  } catch (error) {
    console.error('💥 Erro ao criar superadmin:', error);
    throw error;
  }
}

// 🛒 ORDERS FUNCTIONS - COMPATIBILIDADE TOTAL
export async function createPedido(pedidoData) {
  try {
    const { orders } = await getCollections();
    
    const novoPedido = {
      ...pedidoData,
      created_at: new Date(),
      status: pedidoData.status || 'novo',
      itens: [] // Inicializar array de itens
    };

    const result = await orders.insertOne(novoPedido);
    
    if (result.insertedId) {
      console.log('✅ Pedido criado no MongoDB:', result.insertedId);
      
      // ✅ RETORNAR NO FORMATO ESPERADO PELO SISTEMA
      return {
        id: result.insertedId.toString(), // ← Converter para string
        numero_pedido: novoPedido.numero_pedido,
        status: novoPedido.status,
        total: novoPedido.total,
        created_at: novoPedido.created_at
      };
    }
    
    throw new Error('Falha ao criar pedido');
  } catch (error) {
    console.error('❌ Erro ao criar pedido MongoDB:', error);
    throw error;
  }
}

export async function createPedidoItem(itemData) {
  try {
    const { orders } = await getCollections();
    
    // Gerar ID único para o item
    const itemId = new ObjectId().toString();
    const itemComId = {
      id: itemId, // ← ID único para o item
      ...itemData,
      adicionais: [], // Inicializar array de adicionais
      created_at: new Date()
    };
    
    // Converter pedido_id para ObjectId se necessário
    let pedidoObjectId;
    try {
      pedidoObjectId = ObjectId.isValid(itemData.pedido_id) 
        ? new ObjectId(itemData.pedido_id) 
        : itemData.pedido_id;
    } catch (e) {
      pedidoObjectId = itemData.pedido_id;
    }
    
    const result = await orders.updateOne(
      { _id: pedidoObjectId },
      { 
        $push: { 
          itens: itemComId
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Item adicionado ao pedido');
      
      // ✅ RETORNAR NO FORMATO ESPERADO
      return {
        id: itemId, // ← ID numérico do item (como string)
        nome_produto: itemData.nome_produto,
        quantidade: itemData.quantidade,
        valor_unitario: itemData.valor_unitario,
        valor_total: itemData.valor_total
      };
    }
    
    throw new Error('Falha ao adicionar item ao pedido');
  } catch (error) {
    console.error('❌ Erro ao criar item pedido:', error);
    throw error;
  }
}

export async function createPedidoItemAdicional(adicionalData) {
  try {
    const { orders } = await getCollections();
    
    // Converter pedido_id para ObjectId se necessário
    let pedidoObjectId;
    try {
      pedidoObjectId = ObjectId.isValid(adicionalData.pedido_item_id) 
        ? new ObjectId(adicionalData.pedido_item_id) 
        : adicionalData.pedido_item_id;
    } catch (e) {
      pedidoObjectId = adicionalData.pedido_item_id;
    }
    
    const adicionalComId = {
      id: new ObjectId().toString(),
      ...adicionalData,
      created_at: new Date()
    };
    
    // Adicionar adicional ao item específico
    const result = await orders.updateOne(
      { 
        _id: pedidoObjectId,
        "itens.id": adicionalData.item_id 
      },
      { 
        $push: { 
          "itens.$.adicionais": adicionalComId
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Adicional adicionado ao item');
      
      // ✅ RETORNAR NO FORMATO ESPERADO
      return {
        id: adicionalComId.id,
        nome_adicional: adicionalData.nome_adicional,
        quantidade: adicionalData.quantidade,
        valor_unitario: adicionalData.valor_unitario,
        valor_total: adicionalData.valor_total
      };
    }
    
    throw new Error('Falha ao adicionar adicional ao item');
  } catch (error) {
    console.error('❌ Erro ao criar adicional item:', error);
    throw error;
  }
}

// ✅ HEALTH CHECK
export function hasDatabase() {
  return !!process.env.MONGODB_URI;
}

// Initialize connection on startup
connectMongoDB().catch(console.error);