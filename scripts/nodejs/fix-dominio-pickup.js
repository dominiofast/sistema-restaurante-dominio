// Script específico para corrigir o problema da Dominio
// Execute no console do navegador na página da Dominio

async function fixDominioPickup() {
  console.log('🔧 CORREÇÃO AUTOMÁTICA - DOMINIO PICKUP');
  
  try {
    const { supabase } = window;
    
    if (!supabase) {
      console.error('❌ Supabase não disponível');
      return;
    }
    
    // 1. Buscar empresa Dominio
    console.log('🔍 Buscando empresa Dominio...');
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .ilike('name', '%dominio%');
    
    if (companyError) {
      console.error('❌ Erro ao buscar empresa:', companyError);
      return;
    }
    
    if (!companies || companies.length === 0) {
      console.error('❌ Empresa Dominio não encontrada');
      return;
    }
    
    const dominio = companies[0];
    console.log('✅ Empresa encontrada:', dominio);
    
    // 2. Verificar configuração atual
    console.log('🔍 Verificando configuração atual...');
    const { data: currentConfig, error: configError } = await supabase
      .from('delivery_methods')
      .select('*')
      .eq('company_id', dominio.id);
    
    console.log('📊 Configuração atual:', { currentConfig, configError });
    
    // 3. Forçar configuração correta
    console.log('🔧 Aplicando configuração correta...');
    const { data: updatedConfig, error: updateError } = await supabase
      .from('delivery_methods')
      .upsert({
        company_id: dominio.id,
        delivery: true,   // Habilitar delivery
        pickup: true,     // HABILITAR PICKUP
        eat_in: false,
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (updateError) {
      console.error('❌ Erro ao atualizar:', updateError);
      return;
    }
    
    console.log('✅ Configuração atualizada:', updatedConfig);
    
    // 4. Limpar cache e recarregar
    console.log('🗑️ Limpando cache...');
    if (window.deliveryOptionsService) {
      window.deliveryOptionsService.clearCache();
    }
    
    console.log('🔄 Recarregando página em 2 segundos...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
    console.log('✅ CORREÇÃO CONCLUÍDA! A página será recarregada.');
    
  } catch (error) {
    console.error('❌ Erro na correção:', error);
  }
}

// Função para verificar status atual
async function checkDominioStatus() {
  console.log('🔍 VERIFICANDO STATUS DA DOMINIO');
  
  try {
    const { supabase } = window;
    
    // Buscar empresa
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name')
      .ilike('name', '%dominio%');
    
    if (!companies || companies.length === 0) {
      console.log('❌ Dominio não encontrada');
      return;
    }
    
    const dominio = companies[0];
    console.log('🏢 Empresa:', dominio);
    
    // Buscar configurações
    const { data: config } = await supabase
      .from('delivery_methods')
      .select('*')
      .eq('company_id', dominio.id);
    
    console.log('📊 Configurações atuais:', config);
    
    if (config && config.length > 0) {
      const settings = config[0];
      console.log('🎯 STATUS:');
      console.log(`   Delivery: ${settings.delivery ? '✅ HABILITADO' : '❌ DESABILITADO'}`);
      console.log(`   Pickup: ${settings.pickup ? '✅ HABILITADO' : '❌ DESABILITADO'}`);
      console.log(`   Eat In: ${settings.eat_in ? '✅ HABILITADO' : '❌ DESABILITADO'}`);
      
      if (settings.pickup) {
        console.log('✅ PICKUP ESTÁ HABILITADO - DEVERIA APARECER NO CARDÁPIO');
      } else {
        console.log('❌ PICKUP ESTÁ DESABILITADO - Execute fixDominioPickup() para corrigir');
      }
    } else {
      console.log('⚠️ Nenhuma configuração encontrada - Execute fixDominioPickup() para criar');
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Executar verificação automaticamente
checkDominioStatus();

// Disponibilizar funções globalmente
window.fixDominioPickup = fixDominioPickup;
window.checkDominioStatus = checkDominioStatus;