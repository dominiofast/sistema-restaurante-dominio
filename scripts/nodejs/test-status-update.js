// Script para testar atualização de status diretamente
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://epqppxteicfuzdblbluq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTYwNjAsImV4cCI6MjA2NTY3MjA2MH0.rzwsy0eSZgIZ1Ia3ZU-mapEhgCSuwFsaJNXL-XshfHg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testStatusUpdate() {
  console.log('🔍 Testando atualização de status...');
  
  // Primeiro, vamos verificar a estrutura da tabela
  console.log('📋 Verificando estrutura da tabela pedidos...');
  
  try {
    // Buscar um pedido existente
    const { data: pedidos, error: fetchError } = await supabase
      .from('pedidos')
      .select('id, status, company_id')
      .limit(1);
      
    if (fetchError) {
      console.error('❌ Erro ao buscar pedidos:', fetchError);
      return;
    }
    
    if (!pedidos || pedidos.length === 0) {
      console.log('⚠️ Nenhum pedido encontrado');
      return;
    }
    
    const pedido = pedidos[0];
    console.log('📦 Pedido encontrado:', pedido);
    
    // Testar diferentes valores de status
    const testStatuses = [
      'entregue',
      'analise', 
      'producao',
      'pronto',
      'teste_status_longo_para_verificar_limite'
    ];
    
    for (const testStatus of testStatuses) {
      console.log(`\n🧪 Testando status: "${testStatus}" (${testStatus.length} caracteres)`);
      
      const { error } = await supabase
        .from('pedidos')
        .update({ status: testStatus })
        .eq('id', pedido.id)
        .eq('company_id', pedido.company_id);
        
      if (error) {
        console.error(`❌ Erro ao atualizar para "${testStatus}":`, error);
      } else {
        console.log(`✅ Status "${testStatus}" atualizado com sucesso`);
      }
    }
    
  } catch (err) {
    console.error('💥 Erro geral:', err);
  }
}

testStatusUpdate();
