// Script para criar superadmin no banco de PRODUÇÃO
// Execute este script com a DATABASE_URL de produção configurada

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configurar WebSocket para Neon DB
neonConfig.webSocketConstructor = ws;

async function createSuperadminInProduction() {
  try {
    console.log('🚀 Criando superadmin no banco de PRODUÇÃO...');

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL não configurada');
      console.log('💡 Configure a variável DATABASE_URL com a string de conexão do Neon DB de PRODUÇÃO');
      console.log('💡 Exemplo: export DATABASE_URL="postgresql://user:pass@host/db"');
      return;
    }

    // Mascarar URL para segurança
    const maskedUrl = process.env.DATABASE_URL.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1***$2');
    console.log('🔍 DATABASE_URL de produção:', maskedUrl);

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Verificar informações do banco
    const diagQuery = 'SELECT current_database() as db, current_user as user, current_schema() as schema';
    const diagResult = await pool.query(diagQuery);
    console.log('🔍 Conectado ao banco de produção:', diagResult.rows[0]);

    // Verificar se já existe superadmin
    const existingQuery = `SELECT id, email, role, created_at FROM users WHERE email = 'contato@dominio.tech'`;
    const existingResult = await pool.query(existingQuery);

    if (existingResult.rows.length > 0) {
      console.log('✅ Superadmin já existe no banco de produção:');
      console.log(JSON.stringify(existingResult.rows[0], null, 2));
      await pool.end();
      return;
    }

    // Criar superadmin no banco de produção
    console.log('🚀 Criando superadmin no banco de produção...');
    const createQuery = `
      INSERT INTO users (id, email, name, role, password, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
      RETURNING id, email, name, role, created_at
    `;
    
    const userId = 'b27c24b1-6c54-4ba1-8998-d340fb2286e3';
    const result = await pool.query(createQuery, [
      userId,
      'contato@dominio.tech',
      'Super Admin',
      'super_admin',
      '$2b$12$4oSZ5n71CDm/rytk1RgTLOvg3ktRXjOjsYBU5XAY8th0tsUFACMZ6' // Hash para 'SuperAdmin2024!'
    ]);

    console.log('✅ Superadmin criado com sucesso no banco de produção:', result.rows[0]);

    // Verificar se foi criado
    const verifyQuery = `SELECT * FROM users WHERE email = 'contato@dominio.tech'`;
    const verifyResult = await pool.query(verifyQuery);
    console.log('🔍 Verificação - Usuário encontrado:', verifyResult.rows[0]);

    await pool.end();

  } catch (error) {
    console.error('❌ Erro ao criar superadmin no banco de produção:', error);
  }
}

createSuperadminInProduction();

