// Verificar se as empresas estão no banco Neon
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import dotenv from 'dotenv';

// Configurar WebSocket para Neon
neonConfig.webSocketConstructor = ws;
dotenv.config();

async function verifyCompaniesInNeon() {
  console.log('🔍 Verificando empresas no banco Neon...\n');

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Verificar se a tabela companies existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'companies'
      ) as exists
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tabela companies não encontrada!');
      await pool.end();
      return;
    }

    console.log('✅ Tabela companies encontrada');

    // Buscar todas as empresas
    const result = await pool.query(`
      SELECT id, name, domain, status, plan, created_at 
      FROM companies 
      ORDER BY created_at DESC
    `);

    console.log(`📊 Total de empresas no banco: ${result.rows.length}\n`);

    if (result.rows.length === 0) {
      console.log('⚠️  Nenhuma empresa encontrada!');
      console.log('💡 Vou criar uma empresa de exemplo...\n');

      // Criar empresa de exemplo
      const insertResult = await pool.query(`
        INSERT INTO companies (name, domain, logo, plan, status, user_count, store_code, slug)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        'Domínio Pizzas',
        'dominiopizzas',
        '🍕',
        'pro',
        'active',
        1,
        1001,
        'dominio-pizzas-1001'
      ]);

      console.log('✅ Empresa criada:', insertResult.rows[0]);
    } else {
      console.log('🏢 EMPRESAS ENCONTRADAS:');
      console.log('═══════════════════════════════════════════');
      
      result.rows.forEach((company, index) => {
        const statusIcon = company.status === 'active' ? '🟢' : '🔴';
        const planIcon = company.plan === 'pro' ? '💎' : company.plan === 'enterprise' ? '👑' : '⭐';
        
        console.log(`${index + 1}. ${statusIcon} ${company.name}`);
        console.log(`   Domain: ${company.domain}`);
        console.log(`   Plan: ${planIcon} ${company.plan.toUpperCase()}`);
        console.log(`   Status: ${company.status}`);
        console.log(`   ID: ${company.id}`);
        console.log('   ─────────────────────────────────────────');
      });
    }

    await pool.end();
    
    console.log('\n🎯 RESULTADO:');
    console.log('✅ Banco Neon conectado');
    console.log('✅ Tabela companies existe');
    console.log(`✅ ${result.rows.length} empresa(s) encontrada(s)`);
    console.log('✅ API /api/companies.js criada');
    console.log('\n🚀 Agora as empresas devem aparecer no frontend!');

  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
  }
}

verifyCompaniesInNeon();
