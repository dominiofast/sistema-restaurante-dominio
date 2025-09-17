// CORREÇÃO DIRETA PARA DOMINIO
// Company ID: 7b0b5ca-8e40-47fc-9ff1-bc880aa4cca (visto no debug)

async function corrigirDominioDireto() {
  console.log('🚨 CORREÇÃO DIRETA DOMINIO - COMPANY ID CONHECIDO');
  
  const DOMINIO_COMPANY_ID = '7b0b5ca-8e40-47fc-9ff1-bc880aa4cca';
  
  try {
    console.log('🔧 Forçando pickup = true para Dominio...');
    
    // UPSERT direto com o ID conhecido
    const { data, error } = await supabase
      .from('delivery_methods')
      .upsert({
        company_id: DOMINIO_COMPANY_ID,
        delivery: true,
        pickup: true,      // FORÇAR TRUE
        eat_in: false,
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('❌ Erro:', error);
      return;
    }
    
    console.log('✅ SUCESSO! Dados atualizados:', data);
    
    // Verificar
    const { data: verify } = await supabase
      .from('delivery_methods')
      .select('*')
      .eq('company_id', DOMINIO_COMPANY_ID);
    
    console.log('📊 Verificação:', verify);
    
    if (verify && verify[0] && verify[0].pickup === true) {
      console.log('🎉 CONFIRMADO! Pickup agora é TRUE');
      console.log('🔄 Recarregando página...');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      console.error('❌ Ainda não funcionou');
    }
    
  } catch (err) {
    console.error('❌ Erro:', err);
  }
}

// Executar
corrigirDominioDireto();