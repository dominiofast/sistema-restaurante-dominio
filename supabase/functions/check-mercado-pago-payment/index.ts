import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CheckPaymentRequest {
  paymentId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const body: CheckPaymentRequest = await req.json()
    const { paymentId } = body

    console.log('🔍 Verificando status REAL do pagamento:', paymentId)

    // Buscar registro do pagamento
    const { data: paymentRecord, error: recordError } = await supabase
      .from('mercado_pago_payments')
      .select(`
        *,
        mercado_pago_config!inner(access_token, sandbox_mode)
      `)
      .eq('payment_id', paymentId)
      .single()

    if (recordError || !paymentRecord) {
      throw new Error('Pagamento não encontrado')
    }

    const accessToken = paymentRecord.mercado_pago_config.access_token

    if (!accessToken) {
      throw new Error('Access token não encontrado')
    }

    // Verificar status na API REAL do Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const mpResult = await mpResponse.json()

    if (!mpResponse.ok) {
      console.error('❌ Erro na API Mercado Pago:', mpResult)
      throw new Error('Erro ao consultar status do pagamento')
    }

    const currentStatus = mpResult.status
    const previousStatus = paymentRecord.status

    console.log('📊 Status REAL:', { paymentId, previousStatus, currentStatus })

    // Atualizar status no banco se mudou
    if (currentStatus !== previousStatus) {
      const updateData: any = {
        status: currentStatus,
        updated_at: new Date().toISOString()
      }

      if (currentStatus === 'approved' && previousStatus !== 'approved') {
        updateData.approved_at = new Date().toISOString()
        console.log('✅ Pagamento REAL aprovado!')
      }

      await supabase
        .from('mercado_pago_payments')
        .update(updateData)
        .eq('payment_id', paymentId)
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: paymentId,
          status: currentStatus,
          status_detail: mpResult.status_detail,
          external_reference: mpResult.external_reference,
          transaction_amount: mpResult.transaction_amount,
          date_approved: mpResult.date_approved,
          date_created: mpResult.date_created,
          date_of_expiration: mpResult.date_of_expiration
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Erro:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
