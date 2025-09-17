// SOLUÇÃO IMEDIATA PARA DOMINIO
// Execute este script no console da página da Dominio

async function solucionarDominio() {
  console.log('🚨 INICIANDO CORREÇÃO EMERGENCIAL DA DOMINIO');
  
  try {
    // 1. Identificar a empresa Dominio pelo nome na URL ou contexto
    const url = window.location.href;
    console.log('🔍 URL atual:', url);
    
    // Extrair company ID da URL (assumindo que está no final)
    const companyId = url.split('/').pop();
    console.log('🏢 Company ID detectado:', companyId);
    
    if (!companyId) {
      console.error('❌ Não foi possível detectar o Company ID');
      return;
    }
    
    // 2. Verificar estado atual no banco
    console.log('🔍 Verificando estado atual no banco...');
    const { data: currentData, error: currentError } = await supabase
      .from('delivery_methods')
      .select('*')
      .eq('company_id', companyId);
    
    console.log('📊 Estado atual:', { currentData, currentError });
    
    // 3. FORÇAR configuração correta
    console.log('🔧 FORÇANDO configuração correta...');
    const { data: updatedData, error: updateError } = await supabase
      .from('delivery_methods')
      .upsert({
        company_id: companyId,
        delivery: true,    // Habilitar delivery
        pickup: true,      // FORÇAR PICKUP COMO TRUE
        eat_in: false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'company_id'
      })
      .select();
    
    if (updateError) {
      console.error('❌ Erro ao atualizar:', updateError);
      
      // Tentar INSERT se UPDATE falhou
      console.log('🔄 Tentando INSERT...');
      const { data: insertData, error: insertError } = await supabase
        .from('delivery_methods')
        .insert({
          company_id: companyId,
          delivery: true,
          pickup: true,     // FORÇAR PICKUP
          eat_in: false
        })
        .select();
      
      if (insertError) {
        console.error('❌ Erro no INSERT também:', insertError);
        return;
      }
      
      console.log('✅ INSERT realizado:', insertData);
    } else {
      console.log('✅ UPDATE realizado:', updatedData);
    }
    
    // 4. Verificar se a correção funcionou
    console.log('🔍 Verificando correção...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('delivery_methods')
      .select('*')
      .eq('company_id', companyId);
    
    console.log('📊 Estado após correção:', { verifyData, verifyError });
    
    if (verifyData && verifyData.length > 0 && verifyData[0].pickup === true) {
      console.log('✅ CORREÇÃO CONFIRMADA! Pickup agora está TRUE no banco');
    } else {
      console.error('❌ CORREÇÃO FALHOU! Pickup ainda não está correto');
    }
    
    // 5. Recarregar página
    console.log('🔄 Recarregando página em 2 segundos...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO:', error);
  }
}

// Executar automaticamente
solucionarDominio();