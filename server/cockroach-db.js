// Configuração para CockroachDB Cloud
import { Pool } from '@neondatabase/serverless';

// Configuração do CockroachDB
const COCKROACH_URL = process.env.COCKROACH_URL || process.env.DATABASE_URL;

if (!COCKROACH_URL) {
  throw new Error(
    "COCKROACH_URL must be set. Configure your CockroachDB Cloud connection string."
  );
}

// Criar pool de conexão para CockroachDB
export const cockroachPool = new Pool({ connectionString: COCKROACH_URL });

// Função para testar conexão
export async function testCockroachConnection() {
  try {
    const result = await cockroachPool.query('SELECT current_database() as db, current_user as user, version() as version');
    console.log('🪳 Conectado ao CockroachDB:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com CockroachDB:', error);
    return false;
  }
}

// Função para criar superadmin no CockroachDB
export async function createCockroachSuperadmin() {
  try {
    // Criar tabela de usuários se não existir
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        password TEXT NOT NULL,
        company_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `;
    
    await cockroachPool.query(createTableQuery);
    console.log('✅ Tabela users criada/verificada no CockroachDB');

    // Verificar se superadmin já existe
    const existingQuery = `SELECT id, email, role FROM users WHERE email = 'contato@dominio.tech'`;
    const existingResult = await cockroachPool.query(existingQuery);

    if (existingResult.rows.length > 0) {
      console.log('✅ Superadmin já existe no CockroachDB:', existingResult.rows[0]);
      return { exists: true, user: existingResult.rows[0] };
    }

    // Criar superadmin
    const createQuery = `
      INSERT INTO users (id, email, name, role, password, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
      RETURNING id, email, name, role, created_at
    `;
    
    const userId = 'b27c24b1-6c54-4ba1-8998-d340fb2286e3';
    const result = await cockroachPool.query(createQuery, [
      userId,
      'contato@dominio.tech',
      'Super Admin',
      'super_admin',
      '$2b$12$4oSZ5n71CDm/rytk1RgTLOvg3ktRXjOjsYBU5XAY8th0tsUFACMZ6'
    ]);

    console.log('🎉 Superadmin criado no CockroachDB:', result.rows[0]);
    return { exists: false, user: result.rows[0] };

  } catch (error) {
    console.error('❌ Erro ao criar superadmin no CockroachDB:', error);
    throw error;
  }
}

// Função de autenticação para CockroachDB
export async function authenticateCockroachUser(email, password) {
  const bcrypt = await import('bcryptjs');
  
  const query = `
    SELECT id, email, name, role, password, created_at
    FROM users 
    WHERE email = $1
  `;
  
  const result = await cockroachPool.query(query, [email]);
  
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
}

