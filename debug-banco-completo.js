// Script para debugar completamente o banco Neon
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import dotenv from 'dotenv';

neonConfig.webSocketConstructor = ws;
dotenv.config();

async function debugBancoCompleto() {
  console.log('🔍 DEBUG COMPLETO DO BANCO NEON...\n');

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // 1. TODAS as empresas
    console.log('🏢 1. TODAS AS EMPRESAS:');
    const allCompaniesQuery = 'SELECT id, name, slug, domain, status FROM companies ORDER BY name ASC';
    const allCompaniesResult = await pool.query(allCompaniesQuery);
    
    console.log(`📊 Total: ${allCompaniesResult.rows.length} empresa(s)`);
    allCompaniesResult.rows.forEach((comp, index) => {
      console.log(`${index + 1}. ${comp.name}`);
      console.log(`   ID: ${comp.id}`);
      console.log(`   Slug: ${comp.slug || 'sem slug'}`);
      console.log(`   Domain: ${comp.domain || 'sem domain'}`);
      console.log(`   Status: ${comp.status}`);
      console.log('   ─────────────────────────────────────────');
    });
    console.log('');

    // 2. TODAS as categorias (por empresa)
    console.log('🏷️ 2. TODAS AS CATEGORIAS POR EMPRESA:');
    const allCategoriesQuery = `
      SELECT c.name as categoria, c.is_active, c.order_position, comp.name as empresa, comp.id as empresa_id
      FROM categorias c
      JOIN companies comp ON c.company_id = comp.id
      ORDER BY comp.name, c.order_position ASC, c.name ASC
    `;
    
    const allCategoriesResult = await pool.query(allCategoriesQuery);
    console.log(`📊 Total: ${allCategoriesResult.rows.length} categoria(s)`);
    
    if (allCategoriesResult.rows.length === 0) {
      console.log('❌ NENHUMA categoria encontrada!');
    } else {
      let currentCompany = '';
      allCategoriesResult.rows.forEach(row => {
        if (row.empresa !== currentCompany) {
          currentCompany = row.empresa;
          console.log(`\n🏢 ${currentCompany} (${row.empresa_id}):`);
        }
        const status = row.is_active ? '🟢' : '🔴';
        console.log(`   ${status} ${row.categoria} (pos: ${row.order_position})`);
      });
    }
    console.log('');

    // 3. TODOS os produtos (resumo por empresa)
    console.log('🍕 3. PRODUTOS POR EMPRESA:');
    const productsCountQuery = `
      SELECT comp.name as empresa, COUNT(p.id) as total_produtos
      FROM companies comp
      LEFT JOIN produtos p ON comp.id = p.company_id
      GROUP BY comp.id, comp.name
      ORDER BY comp.name ASC
    `;
    
    const productsCountResult = await pool.query(productsCountQuery);
    productsCountResult.rows.forEach(row => {
      console.log(`📊 ${row.empresa}: ${row.total_produtos} produto(s)`);
    });
    console.log('');

    // 4. Verificar empresa específica "Dominio"
    console.log('🔍 4. PROCURANDO "DOMINIO PIZZAS":');
    const dominioQuery = `SELECT * FROM companies WHERE name ILIKE '%dominio%' OR domain ILIKE '%dominio%'`;
    const dominioResult = await pool.query(dominioQuery);
    
    if (dominioResult.rows.length === 0) {
      console.log('❌ Nenhuma empresa "Domínio" encontrada');
    } else {
      console.log('✅ Empresas encontradas:');
      dominioResult.rows.forEach((comp, index) => {
        console.log(`${index + 1}. ${comp.name} (${comp.id})`);
      });
    }

    await pool.end();
    console.log('\n🔍 RESUMO DO DEBUG:');
    console.log(`✅ Empresas no banco: ${allCompaniesResult.rows.length}`);
    console.log(`✅ Categorias no banco: ${allCategoriesResult.rows.length}`);
    console.log(`✅ Primeira empresa ativa: ${allCompaniesResult.rows.find(c => c.status === 'active')?.name || 'Nenhuma'}`);

  } catch (error) {
    console.error('❌ Erro no debug:', error.message);
  }
}

debugBancoCompleto();
