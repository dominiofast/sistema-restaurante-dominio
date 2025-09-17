// ATUALIZAÇÃO DA EDGE FUNCTION CRIAR-PEDIDO-PUBLICO
// Integrar a função RPC anti-duplicação para prevenir duplicatas

// Substituir a seção de verificação anti-duplicação existente (linhas ~90-130)
// pela versão melhorada abaixo:

/*
// VERIFICAÇÃO ANTI-DUPLICAÇÃO MELHORADA usando RPC
let pixPaymentId = null;
try {
  const parsedPayment = JSON.parse(pedidoData.pagamento);
  if (parsedPayment.method === 'pix' && parsedPayment.id) {
    pixPaymentId = parsedPayment.id;
  }
} catch {
  // Se não conseguir fazer parse, continuar normalmente
}

console.log('🔍 Verificação anti-duplicação avançada:', {
  pixPaymentId,
  telefone: pedidoData.cliente.telefone,
  total: pedidoData.total
});

// Usar a função RPC para verificação mais robusta
const { data: duplicateCheck, error: duplicateError } = await supabase
  .rpc('rpc_check_existing_order', {
    p_company_id: pedidoData.companyId,
    p_payment_id: pixPaymentId,
    p_customer_phone: pedidoData.cliente.telefone,
    p_amount: pedidoData.total
  });

if (duplicateError) {
  console.error('❌ Erro na verificação anti-duplicação:', duplicateError);
  // Continuar com criação do pedido se houver erro na verificação
} else if (duplicateCheck?.has_duplicates) {
  console.log('⚠️ DUPLICAÇÃO DETECTADA E PREVENIDA:', duplicateCheck);
  const existingOrder = duplicateCheck.existing_orders[0];
  
  // Log adicional da prevenção
  await supabase
    .from('ai_conversation_logs')
    .insert({
      company_id: pedidoData.companyId,
      customer_phone: pedidoData.cliente.telefone,
      customer_name: pedidoData.cliente.nome,
      message_content: `DUPLICAÇÃO PREVENIDA: Tentativa de criar pedido duplicado. Pedido existente: ${existingOrder.id} (${existingOrder.numero_pedido}). Payment ID: ${pixPaymentId || 'N/A'}`,
      message_type: 'duplicate_prevention_success',
      created_at: new Date().toISOString()
    });
  
  return new Response(
    JSON.stringify({
      success: true,
      pedido_id: existingOrder.id,
      numero_pedido: existingOrder.numero_pedido,
      message: 'Pedido já existe - duplicação prevenida com sucesso',
      duplicate_prevented: true,
      duplicate_details: {
        existing_order: existingOrder,
        check_result: duplicateCheck,
        prevention_timestamp: new Date().toISOString()
      }
    }),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
} else {
  console.log('✅ Nenhuma duplicação detectada, prosseguindo com criação do pedido');
}
*/

// INSTRUÇÕES PARA APLICAR A CORREÇÃO:
// 1. Execute o script integrate-anti-duplicate-function.sql no Supabase
// 2. Substitua a seção de verificação anti-duplicação na edge function
// 3. Teste com novos pedidos "Vangleiza"

// LOCALIZAÇÃO DA ALTERAÇÃO:
// Arquivo: supabase/functions/criar-pedido-publico/index.ts
// Linhas: ~90-130 (seção "VERIFICAÇÃO ANTI-DUPLICAÇÃO")

// BENEFÍCIOS DA NOVA IMPLEMENTAÇÃO:
// - Verificação mais robusta com múltiplos critérios
// - Logs detalhados de prevenção
// - Retorno de informações sobre pedidos existentes
// - Melhor tratamento de erros
// - Funciona para todos os tipos de pagamento, não só PIX

console.log('📝 Instruções de atualização criadas para criar-pedido-publico');
console.log('🔧 Execute integrate-anti-duplicate-function.sql primeiro');
console.log('✏️ Depois substitua o código na edge function conforme comentários acima');