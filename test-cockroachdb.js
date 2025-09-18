// Script para testar conexão com CockroachDB Cloud
import pkg from 'pg';
const { Pool } = pkg;

async function testCockroachDB() {
  try {
    console.log('🪳 Testando conexão com CockroachDB Cloud...');

    // Substitua pela sua string de conexão do CockroachDB
    const COCKROACH_URL = process.env.COCKROACH_URL || 'postgresql://username:password@host:port/database?sslmode=require';
    
    if (!process.env.COCKROACH_URL) {
      console.log('⚠️ Configure a variável COCKROACH_URL com sua string de conexão');
      console.log('💡 Exemplo: export COCKROACH_URL="postgresql://user:pass@host:port/db?sslmode=require"');
      return;
    }

    const pool = new Pool({ connectionString: COCKROACH_URL });

    // Testar conexão
    const diagQuery = 'SELECT current_database() as db, current_user as user, version() as version';
    const diagResult = await pool.query(diagQuery);
    console.log('✅ Conectado ao CockroachDB:', diagResult.rows[0]);

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
    
    await pool.query(createTableQuery);
    console.log('✅ Tabela users criada/verificada');

    // Criar superadmin
    const superadminQuery = `
      INSERT INTO users (id, email, name, role, password, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        password = EXCLUDED.password,
        updated_at = NOW()
      RETURNING id, email, name, role, created_at
    `;
    
    const userId = 'b27c24b1-6c54-4ba1-8998-d340fb2286e3';
    const result = await pool.query(superadminQuery, [
      userId,
      'contato@dominio.tech',
      'Super Admin',
      'super_admin',
      '$2b$12$4oSZ5n71CDm/rytk1RgTLOvg3ktRXjOjsYBU5XAY8th0tsUFACMZ6' // Hash para 'Admin123!@#'
    ]);

    console.log('✅ Superadmin criado/atualizado:', result.rows[0]);

    // Listar usuários
    const usersQuery = `SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC`;
    const usersResult = await pool.query(usersQuery);
    console.log(`\n👥 Usuários no CockroachDB (${usersResult.rows.length}):`);
    usersResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role}) - ${user.created_at}`);
    });

    await pool.end();
    console.log('🎉 Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao conectar com CockroachDB:', error);
    console.log('\n💡 Verifique:');
    console.log('1. Se a string de conexão está correta');
    console.log('2. Se o cluster está ativo');
    console.log('3. Se as credenciais estão corretas');
    console.log('4. Se o SSL está configurado (sslmode=require)');
  }
}

testCockroachDB();
