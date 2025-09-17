// Script de debug para verificar delivery methods
// Execute no console do navegador na página do cardápio

async function debugDeliveryMethods() {
  // Pegar o companyId da URL ou contexto
  const url = window.location.href;
  const companyId = url.match(/\/([^\/]+)$/)?.[1]; // Extrai o último segmento da URL
  
  console.log('🔍 Debug Delivery Methods');
  console.log('Company ID:', companyId);
  
  if (!companyId) {
    console.error('❌ Company ID não encontrado na URL');
    return;
  }
  
  try {
    // Importar supabase (assumindo que está disponível globalmente)
    const { supabase } = window;
    
    if (!supabase) {
      console.error('❌ Supabase não está disponível');
      return;
    }
    
    // Consultar delivery methods
    const { data, error } = await supabase
      .from('delivery_methods')
      .select('*')
      .eq('company_id', companyId);
    
    console.log('📊 Resultado da consulta:');
    console.log('Data:', data);
    console.log('Error:', error);
    
    if (data && data.length > 0) {
      const methods = data[0];
      console.log('✅ Configurações encontradas:');
      console.log('- Delivery:', methods.delivery);
      console.log('- Pickup:', methods.pickup);
      console.log('- Eat In:', methods.eat_in);
    } else {
      console.log('⚠️ Nenhuma configuração encontrada para esta empresa');
    }
    
  } catch (err) {
    console.error('❌ Erro na consulta:', err);
  }
}

// Executar automaticamente
debugDeliveryMethods();