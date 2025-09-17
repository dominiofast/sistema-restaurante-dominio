// Script para debugar todas as empresas e suas configurações de delivery
// Execute no console do navegador

async function debugAllCompanies() {
  console.log('🔍 DEBUG: Verificando todas as empresas e suas configurações');
  
  try {
    // Assumindo que supabase está disponível globalmente
    const { supabase } = window;
    
    if (!supabase) {
      console.error('❌ Supabase não está disponível');
      return;
    }
    
    // 1. Buscar todas as empresas
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name');
    
    if (companiesError) {
      console.error('❌ Erro ao buscar empresas:', companiesError);
      return;
    }
    
    console.log(`📊 Encontradas ${companies.length} empresas`);
    
    // 2. Para cada empresa, buscar suas configurações de delivery
    for (const company of companies) {
      console.log(`\n🏢 Empresa: ${company.name} (ID: ${company.id})`);
      
      const { data: deliveryMethods, error: deliveryError } = await supabase
        .from('delivery_methods')
        .select('*')
        .eq('company_id', company.id);
      
      if (deliveryError) {
        console.error(`❌ Erro ao buscar delivery methods para ${company.name}:`, deliveryError);
        continue;
      }
      
      if (!deliveryMethods || deliveryMethods.length === 0) {
        console.log(`⚠️ Nenhuma configuração de delivery encontrada para ${company.name}`);
      } else {
        const config = deliveryMethods[0];
        console.log(`✅ Configurações para ${company.name}:`);
        console.log(`   - Delivery: ${config.delivery}`);
        console.log(`   - Pickup: ${config.pickup}`);
        console.log(`   - Eat In: ${config.eat_in}`);
        console.log(`   - Criado em: ${config.created_at}`);
        console.log(`   - Atualizado em: ${config.updated_at}`);
        
        // Destacar empresas específicas
        if (company.name.toLowerCase().includes('dominio')) {
          console.log(`🎯 DOMINIO ENCONTRADA! Pickup: ${config.pickup}`);
        }
        if (company.name.toLowerCase().includes('300') && company.name.toLowerCase().includes('graus')) {
          console.log(`🎯 300 GRAUS ENCONTRADA! Pickup: ${config.pickup}`);
        }
      }
    }
    
  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

// Função específica para verificar uma empresa pelo nome
async function debugCompanyByName(companyName) {
  console.log(`🔍 Buscando empresa: ${companyName}`);
  
  try {
    const { supabase } = window;
    
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name')
      .ilike('name', `%${companyName}%`);
    
    if (error) {
      console.error('❌ Erro:', error);
      return;
    }
    
    if (companies.length === 0) {
      console.log('❌ Empresa não encontrada');
      return;
    }
    
    for (const company of companies) {
      console.log(`\n🏢 ${company.name} (${company.id})`);
      
      const { data: deliveryMethods } = await supabase
        .from('delivery_methods')
        .select('*')
        .eq('company_id', company.id);
      
      if (deliveryMethods && deliveryMethods.length > 0) {
        console.log('📋 Configurações:', deliveryMethods[0]);
      } else {
        console.log('⚠️ Sem configurações de delivery');
      }
    }
    
  } catch (err) {
    console.error('❌ Erro:', err);
  }
}

// Executar automaticamente
debugAllCompanies();

// Disponibilizar função global
window.debugCompanyByName = debugCompanyByName;