import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔄 Iniciando recuperação de pagamentos órfãos...');

    // Buscar pagamentos órfãos
    const { data: orphanPayments, error: orphanError } = await supabaseClient
      .rpc('identify_orphan_payments');

    if (orphanError) {
      console.error('❌ Erro ao buscar pagamentos órfãos:', orphanError);
      throw orphanError;
    }

    const orphans = orphanPayments.filter(p => !p.has_matching_order && p.days_since_payment <= 1);
    
    console.log(`📊 Encontrados ${orphans.length} pagamentos órfãos para recuperar`);

    let recovered = 0;
    let failed = 0;

    for (const payment of orphans) {
      try {
        // Tentar criar pedido automaticamente
        const orderResult = await attemptCreateOrder(supabaseClient, payment);
        
        if (orderResult.success) {
          recovered++;
          console.log(`✅ Pedido recuperado: ${payment.payment_id} -> Pedido #${orderResult.order_number}`);
        } else {
          failed++;
          console.log(`❌ Falha na recuperação: ${payment.payment_id} - ${orderResult.error}`);
        }
      } catch (err) {
        failed++;
        console.error(`❌ Erro ao recuperar ${payment.payment_id}:`, err);
      }
    }

    // Log do resultado
    await supabaseClient
      .from('ai_conversation_logs')
      .insert({
        company_id: '550e8400-e29b-41d4-a716-446655440001', // Company padrão
        customer_phone: 'SYSTEM_RECOVERY',
        customer_name: 'AUTO_RECOVERY',
        message_content: `RECUPERAÇÃO AUTOMÁTICA: ${recovered} pedidos recuperados, ${failed} falhas de ${orphans.length} pagamentos órfãos`,
        message_type: 'orphan_recovery_completed'
      });

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total_orphans: orphans.length,
          recovered,
          failed
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro na recuperação:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function attemptCreateOrder(supabaseClient: any, payment: any) {
  try {
    // VERIFICAÇÃO ANTI-DUPLICAÇÃO: Verificar se já existe pedido para este pagamento
    console.log('🔍 Verificando se já existe pedido para pagamento:', payment.payment_id);
    
    const { data: existingOrder, error: checkError } = await supabaseClient
      .from('pedidos')
      .select('id, numero_pedido')
      .eq('company_id', payment.company_id)
      .or(`observacoes.ilike.%${payment.payment_id}%,pagamento.ilike.%${payment.payment_id}%`)
      .limit(1)
      .single();

    if (existingOrder && !checkError) {
      console.log('⚠️ Pedido já existe para este pagamento:', existingOrder);
      return { 
        success: true, 
        order_number: existingOrder.numero_pedido || existingOrder.id,
        order_id: existingOrder.id,
        duplicate_prevented: true
      };
    }

    // Buscar dados da empresa
    const { data: company } = await supabaseClient
      .from('companies')
      .select('*')
      .eq('id', payment.company_id)
      .single();

    if (!company) {
      return { success: false, error: 'Empresa não encontrada' };
    }

    // Criar pedido básico com dados do pagamento
    const orderData = {
      company_id: company.id,
      nome: payment.customer_phone, // Usar telefone como nome se não tiver
      telefone: payment.customer_phone,
      endereco: 'Endereço não informado - Recuperação automática',
      tipo: 'delivery',
      pagamento: `PIX Online Asaas - Recuperado - ${payment.payment_id}`,
      total: payment.amount,
      observacoes: `Pedido recuperado automaticamente. Pagamento PIX confirmado: ${payment.payment_id}`,
      status: 'confirmed'
    };

    const { data: order, error: orderError } = await supabaseClient
      .from('pedidos')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      return { success: false, error: orderError.message };
    }

    return { 
      success: true, 
      order_number: order.numero_pedido || order.id,
      order_id: order.id 
    };

  } catch (err) {
    return { success: false, error: err.message };
  }
}