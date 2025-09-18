// API de Login para Vercel (Serverless)
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import bcrypt from 'bcryptjs';

// Configurar WebSocket para Neon
neonConfig.webSocketConstructor = ws;

// Função para autenticar usuário no Neon PostgreSQL
async function authenticateUser(email, password) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const query = `
      SELECT id, email, name, role, password, created_at
      FROM users 
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null; // Usuário não encontrado
    }
    
    const user = result.rows[0];
    
    // Verificar senha
    if (!user.password) {
      return null; // Usuário sem senha
    }
    
    const isValidPassword = bcrypt.compareSync(password, user.password);
    
    if (!isValidPassword) {
      return null; // Senha incorreta
    }
    
    // Retornar usuário sem senha
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
    
  } finally {
    await pool.end();
  }
}

// Handler principal da API
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido'
    });
  }

  console.log('🔐 API /login - Tentativa de login:', { email: req.body.email });

  try {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }

    // Verificar se DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL não configurada');
      return res.status(500).json({
        success: false,
        error: 'Erro de configuração do banco de dados'
      });
    }

    // Autenticar usuário
    const user = await authenticateUser(email, password);

    if (!user) {
      console.log('❌ Login falhou - credenciais inválidas');
      return res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos'
      });
    }

    console.log('✅ Login realizado com sucesso:', { email: user.email, role: user.role });

    // Retornar dados do usuário (sem senha)
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at
      },
      message: 'Login realizado com sucesso'
    });

  } catch (error) {
    console.error('💥 API /login - Erro interno:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}
