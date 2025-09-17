import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { paymentId } = await req.json();

    console.log('🔍 Verificando status do pagamento:', paymentId);

    // Buscar pagamento no banco para obter company_id
    const { data: payment, error: paymentError } = await supabaseClient
      .from('asaas_payments')
      .select('company_id, payment_id')
      .eq('payment_id', paymentId)
      .single();

    if (paymentError || !payment) {
      console.error('❌ Pagamento não encontrado:', paymentError);
      return new Response(
        JSON.stringify({ success: false, error: 'Pagamento não encontrado' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Buscar configuração do Asaas
    const { data: asaasConfig, error: configError } = await supabaseClient
      .from('asaas_config')
      .select('*')
      .eq('company_id', payment.company_id)
      .single();

    if (configError || !asaasConfig) {
      console.error('❌ Configuração Asaas não encontrada:', configError);
      return new Response(
        JSON.stringify({ success: false, error: 'Configuração do Asaas não encontrada' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // URL da API
    const baseUrl = asaasConfig.sandbox_mode 
      ? 'https://sandbox.asaas.com/api/v3'
      : 'https://www.asaas.com/api/v3';

    // Consultar status no Asaas
    const statusResponse = await fetch(`${baseUrl}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'access_token': asaasConfig.api_key,
        'Content-Type': 'application/json'
      }
    });

    if (!statusResponse.ok) {
      console.error('❌ Erro ao consultar status no Asaas:', statusResponse.status);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao consultar status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const statusData = await statusResponse.json();
    console.log('📊 Status atual no Asaas:', statusData.status);

    // Log detalhado do status
    console.log('📊 Status detalhado do Asaas:', {
      payment_id: paymentId,
      status: statusData.status,
      dateCreated: statusData.dateCreated,
      paymentDate: statusData.paymentDate,
      value: statusData.value,
      billingType: statusData.billingType
    });

    // Verificar se houve mudança de status antes de atualizar
    const { data: currentPayment } = await supabaseClient
      .from('asaas_payments')
      .select('status, confirmed_at')
      .eq('payment_id', paymentId)
      .single();

    const isConfirmed = statusData.status === 'CONFIRMED' || statusData.status === 'RECEIVED';
    const statusChanged = currentPayment?.status !== statusData.status;
    const nowConfirmed = isConfirmed && !currentPayment?.confirmed_at;

    // Atualizar status no banco
    const { error: updateError } = await supabaseClient
      .from('asaas_payments')
      .update({ 
        status: statusData.status,
        confirmed_at: isConfirmed 
          ? (currentPayment?.confirmed_at || new Date().toISOString())
          : null,
        asaas_response: statusData // Salvar resposta completa para debug
      })
      .eq('payment_id', paymentId);

    if (updateError) {
      console.error('❌ Erro ao atualizar status:', updateError);
    } else if (statusChanged) {
      console.log('✅ Status atualizado:', {
        old_status: currentPayment?.status,
        new_status: statusData.status,
        now_confirmed: nowConfirmed
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: statusData.id,
          status: statusData.status,
          value: statusData.value
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro interno:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});